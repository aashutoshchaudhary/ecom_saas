import { PrismaClient } from '@prisma/client';
import {
  generateId, AppError, NotFoundError,
  parsePagination, paginationHelper,
  EventProducer, KafkaTopics, EventTypes,
} from '@siteforge/shared';
import { promptBuilderService } from './prompt-builder.service';

const prisma = new PrismaClient();

async function callAI(prompt: string, systemPrompt: string): Promise<string> {
  // Try Anthropic first, then OpenAI, then fallback
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const Anthropic = require('@anthropic-ai/sdk');
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      });
      const textBlock = response.content.find((b: any) => b.type === 'text');
      return textBlock?.text || '';
    } catch (err: any) {
      console.error('Anthropic API error:', err.message);
    }
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      const OpenAI = require('openai');
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 4096,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
      });
      return response.choices[0]?.message?.content || '';
    } catch (err: any) {
      console.error('OpenAI API error:', err.message);
    }
  }

  // Fallback: generate structured data without API
  return generateFallbackResponse(prompt, systemPrompt);
}

function generateFallbackResponse(_prompt: string, _systemPrompt: string): string {
  return '{}';
}

function extractJSON(text: string): any {
  // Try to find JSON in markdown code blocks or raw JSON
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
  if (jsonMatch) {
    try { return JSON.parse(jsonMatch[1]); } catch {}
  }
  try { return JSON.parse(text); } catch {}
  return null;
}

export class AiService {
  async generateWebsite(tenantId: string, data: {
    websiteId: string; industry: string; businessName: string;
    description?: string; preferences?: Record<string, unknown>;
  }) {
    const job = await this.createJob(tenantId, 'WEBSITE', data);

    try {
      await EventProducer.publish(
        KafkaTopics.AI_EVENTS, EventTypes.AI_GENERATION_STARTED,
        { jobId: job.id, tenantId, type: 'WEBSITE', websiteId: data.websiteId },
        tenantId
      );
    } catch {}

    // Process immediately (can be moved to queue in production)
    this.processJob(job.id).catch(console.error);
    return job;
  }

  async generatePage(tenantId: string, data: {
    websiteId: string; pageType: string; industry: string;
    context?: Record<string, unknown>;
  }) {
    const job = await this.createJob(tenantId, 'PAGE', data);
    this.processJob(job.id).catch(console.error);
    return job;
  }

  async generateSection(tenantId: string, data: {
    websiteId: string; pageId: string; sectionType: string;
    industry: string; context?: Record<string, unknown>;
  }) {
    const job = await this.createJob(tenantId, 'SECTION', data);
    this.processJob(job.id).catch(console.error);
    return job;
  }

  async generateContent(tenantId: string, data: {
    type: string; industry: string; topic: string;
    tone?: string; length?: string;
  }) {
    const job = await this.createJob(tenantId, 'CONTENT', data);
    this.processJob(job.id).catch(console.error);
    return job;
  }

  async generateImage(tenantId: string, data: {
    prompt: string; style?: string; size?: string;
  }) {
    const job = await this.createJob(tenantId, 'IMAGE', data);
    this.processJob(job.id).catch(console.error);
    return job;
  }

  async regenerate(tenantId: string, jobId: string) {
    const originalJob = await this.getJob(tenantId, jobId);
    const job = await this.createJob(tenantId, originalJob.type, originalJob.input as Record<string, unknown>);
    this.processJob(job.id).catch(console.error);
    return job;
  }

  async listJobs(tenantId: string, query: { page?: string; limit?: string; status?: string; type?: string }) {
    const { page, limit, skip } = parsePagination(query);
    const where: any = { tenantId };
    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;

    const [jobs, total] = await Promise.all([
      prisma.aiJob.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.aiJob.count({ where }),
    ]);

    return paginationHelper(jobs, total, page, limit);
  }

  async getJob(tenantId: string, jobId: string) {
    const job = await prisma.aiJob.findUnique({ where: { id: jobId } });
    if (!job || job.tenantId !== tenantId) {
      throw new NotFoundError('AI Job', jobId);
    }
    return job;
  }

  async processJob(jobId: string) {
    const job = await prisma.aiJob.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundError('AI Job', jobId);

    try {
      await prisma.aiJob.update({
        where: { id: jobId },
        data: { status: 'PROCESSING', startedAt: new Date() },
      });

      const input = job.input as Record<string, unknown>;
      let result: any;

      switch (job.type) {
        case 'WEBSITE_GENERATION':
        case 'WEBSITE_REGENERATION':
          result = await this.processWebsiteGeneration(input);
          break;
        case 'PAGE_GENERATION':
          result = await this.processPageGeneration(input);
          break;
        case 'SECTION_GENERATION':
          result = await this.processSectionGeneration(input);
          break;
        case 'CONTENT_GENERATION':
          result = await this.processContentGeneration(input);
          break;
        case 'IMAGE_GENERATION':
          result = await this.processImageGeneration(input);
          break;
        default:
          result = { prompt: promptBuilderService.buildPrompt(job.type, input) };
      }

      await prisma.aiJob.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          output: result as any,
          completedAt: new Date(),
          creditsCost: this.calculateCredits(job.type),
        },
      });

      try {
        await EventProducer.publish(
          KafkaTopics.AI_EVENTS, EventTypes.AI_GENERATION_COMPLETED,
          { jobId, tenantId: job.tenantId, type: job.type, creditsUsed: this.calculateCredits(job.type) },
          job.tenantId
        );
      } catch {}
    } catch (error) {
      await prisma.aiJob.update({
        where: { id: jobId },
        data: { status: 'FAILED', error: error instanceof Error ? error.message : 'Unknown error' },
      });

      try {
        await EventProducer.publish(
          KafkaTopics.AI_EVENTS, EventTypes.AI_GENERATION_FAILED,
          { jobId, tenantId: job.tenantId, error: error instanceof Error ? error.message : 'Unknown' },
          job.tenantId
        );
      } catch {}
    }
  }

  private async processWebsiteGeneration(input: Record<string, unknown>) {
    const industry = input.industry as string || 'general';
    const businessName = input.businessName as string || 'My Business';
    const description = input.description as string || '';
    const prompt = promptBuilderService.buildPrompt('WEBSITE', input);

    const systemPrompt = `You are an expert web designer and developer. Generate complete website structures as valid JSON.
Your output must be a valid JSON object with this exact structure:
{
  "pages": [
    {
      "name": "string",
      "slug": "string",
      "isHome": boolean,
      "seo": { "title": "string", "description": "string" },
      "sections": [
        {
          "type": "hero|features|about|testimonials|pricing|cta|contact|gallery|team|faq|stats|newsletter",
          "component": "string (matching section component name)",
          "props": {
            "heading": "string",
            "subheading": "string",
            "content": "string",
            "items": [...],
            "ctaText": "string",
            "ctaLink": "string",
            "backgroundImage": "string (URL)"
          }
        }
      ]
    }
  ],
  "theme": {
    "primaryColor": "#hex",
    "secondaryColor": "#hex",
    "accentColor": "#hex",
    "backgroundColor": "#hex",
    "textColor": "#hex",
    "fontFamily": "string",
    "headingFont": "string"
  },
  "settings": {
    "favicon": "string",
    "logo": "string",
    "socialLinks": {}
  }
}
Generate realistic, industry-appropriate content. All text should be real business copy, not placeholder/lorem ipsum.`;

    const aiResponse = await callAI(prompt, systemPrompt);
    const parsed = extractJSON(aiResponse);

    if (parsed && parsed.pages) return parsed;

    // Fallback: generate structured data directly
    return this.generateWebsiteStructure(industry, businessName, description);
  }

  private async processPageGeneration(input: Record<string, unknown>) {
    const prompt = promptBuilderService.buildPrompt('PAGE', input);
    const systemPrompt = `You are an expert web designer. Generate a page structure as valid JSON with this format:
{
  "name": "string",
  "slug": "string",
  "seo": { "title": "string", "description": "string" },
  "sections": [
    {
      "type": "string",
      "component": "string",
      "props": { "heading": "string", "content": "string", "items": [...] }
    }
  ]
}
Generate realistic business content, not placeholder text.`;

    const aiResponse = await callAI(prompt, systemPrompt);
    const parsed = extractJSON(aiResponse);

    if (parsed && parsed.sections) return parsed;

    const pageType = input.pageType as string || 'about';
    return this.generatePageStructure(pageType, input.industry as string || 'general');
  }

  private async processSectionGeneration(input: Record<string, unknown>) {
    const prompt = promptBuilderService.buildPrompt('SECTION', input);
    const systemPrompt = `You are an expert web designer. Generate a website section as valid JSON with this format:
{
  "type": "string",
  "component": "string",
  "props": { "heading": "string", "subheading": "string", "content": "string", "items": [...], "ctaText": "string" }
}
Generate realistic business content.`;

    const aiResponse = await callAI(prompt, systemPrompt);
    const parsed = extractJSON(aiResponse);
    if (parsed) return parsed;

    return {
      type: input.sectionType || 'hero',
      component: `Hero${(input.sectionType as string || 'gradient').charAt(0).toUpperCase()}${(input.sectionType as string || 'gradient').slice(1)}`,
      props: {
        heading: 'Transform Your Business',
        subheading: 'Discover the power of modern solutions',
        content: 'We help businesses grow with cutting-edge technology and expert guidance.',
        ctaText: 'Get Started',
        ctaLink: '#contact',
      },
    };
  }

  private async processContentGeneration(input: Record<string, unknown>) {
    const prompt = promptBuilderService.buildPrompt('CONTENT', input);
    const systemPrompt = `You are an expert copywriter. Generate content as valid JSON:
{ "headline": "string", "body": "string", "summary": "string" }`;

    const aiResponse = await callAI(prompt, systemPrompt);
    const parsed = extractJSON(aiResponse);
    if (parsed) return parsed;

    return {
      headline: `Expert ${input.topic || 'Business'} Solutions`,
      body: `Discover comprehensive ${input.topic || 'business'} solutions designed for modern enterprises. Our approach combines industry expertise with innovative technology to deliver measurable results.`,
      summary: `Professional ${input.topic || 'business'} services tailored to your needs.`,
    };
  }

  private async processImageGeneration(input: Record<string, unknown>) {
    const prompt = input.prompt as string || 'professional business image';
    const style = input.style as string || 'professional';
    const size = input.size as string || '1024x1024';

    // Try OpenAI DALL-E if available
    if (process.env.OPENAI_API_KEY) {
      try {
        const OpenAI = require('openai');
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const response = await client.images.generate({
          model: 'dall-e-3',
          prompt: `${prompt}, ${style} style, high quality, suitable for business website`,
          n: 1,
          size: size === '512x512' ? '1024x1024' : size === '1920x1080' ? '1792x1024' : '1024x1024',
        });
        return { url: response.data[0]?.url, revisedPrompt: response.data[0]?.revised_prompt };
      } catch (err: any) {
        console.error('Image generation error:', err.message);
      }
    }

    // Fallback: use placeholder
    const [w, h] = size.split('x').map(Number);
    const category = style === 'realistic' ? 'business' : style === 'artistic' ? 'art' : 'technology';
    return {
      url: `https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=${w || 1024}&h=${h || 1024}&fit=crop`,
      fallback: true,
      prompt,
      style,
    };
  }

  private generateWebsiteStructure(industry: string, businessName: string, description: string) {
    const industryConfig: Record<string, any> = {
      ecommerce: {
        theme: { primaryColor: '#4F46E5', secondaryColor: '#7C3AED', accentColor: '#F59E0B', backgroundColor: '#FFFFFF', textColor: '#1F2937', fontFamily: 'Inter', headingFont: 'Plus Jakarta Sans' },
        pages: [
          { name: 'Home', slug: '/', isHome: true, sections: ['hero', 'features', 'products', 'testimonials', 'newsletter'] },
          { name: 'Products', slug: '/products', sections: ['productGrid', 'categories', 'cta'] },
          { name: 'About', slug: '/about', sections: ['about', 'team', 'stats'] },
          { name: 'Contact', slug: '/contact', sections: ['contact', 'faq'] },
        ],
      },
      restaurant: {
        theme: { primaryColor: '#DC2626', secondaryColor: '#B91C1C', accentColor: '#F59E0B', backgroundColor: '#FFFBEB', textColor: '#1F2937', fontFamily: 'Playfair Display', headingFont: 'Playfair Display' },
        pages: [
          { name: 'Home', slug: '/', isHome: true, sections: ['hero', 'about', 'menu', 'gallery', 'testimonials', 'reservation'] },
          { name: 'Menu', slug: '/menu', sections: ['menuFull', 'specials'] },
          { name: 'Reservations', slug: '/reservations', sections: ['reservation', 'hours'] },
          { name: 'About', slug: '/about', sections: ['story', 'team', 'gallery'] },
          { name: 'Contact', slug: '/contact', sections: ['contact', 'map'] },
        ],
      },
      services: {
        theme: { primaryColor: '#0EA5E9', secondaryColor: '#0284C7', accentColor: '#10B981', backgroundColor: '#FFFFFF', textColor: '#0F172A', fontFamily: 'Inter', headingFont: 'Plus Jakarta Sans' },
        pages: [
          { name: 'Home', slug: '/', isHome: true, sections: ['hero', 'services', 'process', 'stats', 'testimonials', 'cta'] },
          { name: 'Services', slug: '/services', sections: ['servicesList', 'pricing', 'faq'] },
          { name: 'Portfolio', slug: '/portfolio', sections: ['portfolio', 'caseStudies'] },
          { name: 'About', slug: '/about', sections: ['about', 'team', 'values'] },
          { name: 'Contact', slug: '/contact', sections: ['contact', 'map'] },
        ],
      },
      default: {
        theme: { primaryColor: '#6366F1', secondaryColor: '#4F46E5', accentColor: '#EC4899', backgroundColor: '#FFFFFF', textColor: '#111827', fontFamily: 'Inter', headingFont: 'Plus Jakarta Sans' },
        pages: [
          { name: 'Home', slug: '/', isHome: true, sections: ['hero', 'features', 'about', 'testimonials', 'cta'] },
          { name: 'About', slug: '/about', sections: ['about', 'team', 'stats'] },
          { name: 'Services', slug: '/services', sections: ['services', 'pricing', 'faq'] },
          { name: 'Blog', slug: '/blog', sections: ['blogList'] },
          { name: 'Contact', slug: '/contact', sections: ['contact', 'newsletter'] },
        ],
      },
    };

    const config = industryConfig[industry] || industryConfig.default;
    const sectionContent = this.getSectionContent(businessName, description, industry);

    const pages = config.pages.map((page: any) => ({
      name: page.name,
      slug: page.slug,
      isHome: page.isHome || false,
      seo: {
        title: `${page.name} | ${businessName}`,
        description: `${page.name} page for ${businessName}. ${description}`.slice(0, 160),
      },
      sections: page.sections.map((sType: string) => ({
        id: generateId(),
        type: sType,
        component: this.getComponentName(sType),
        visible: true,
        locked: false,
        props: sectionContent[sType] || { heading: page.name, content: description || `Welcome to ${businessName}` },
      })),
    }));

    return {
      pages,
      theme: config.theme,
      settings: {
        businessName,
        industry,
        description,
        logo: null,
        favicon: null,
        socialLinks: { facebook: '', twitter: '', instagram: '', linkedin: '' },
      },
    };
  }

  private generatePageStructure(pageType: string, industry: string) {
    const sectionMap: Record<string, string[]> = {
      home: ['hero', 'features', 'about', 'testimonials', 'cta'],
      about: ['about', 'team', 'stats', 'values'],
      services: ['services', 'process', 'pricing', 'faq'],
      contact: ['contact', 'map', 'faq'],
      products: ['productGrid', 'categories', 'cta'],
      blog: ['blogList', 'newsletter'],
      portfolio: ['portfolio', 'caseStudies', 'cta'],
      pricing: ['pricing', 'features', 'faq', 'cta'],
    };

    const sections = (sectionMap[pageType] || sectionMap.home).map(type => ({
      id: generateId(),
      type,
      component: this.getComponentName(type),
      visible: true,
      locked: false,
      props: { heading: type.charAt(0).toUpperCase() + type.slice(1), content: 'AI-generated content' },
    }));

    return {
      name: pageType.charAt(0).toUpperCase() + pageType.slice(1),
      slug: `/${pageType === 'home' ? '' : pageType}`,
      seo: { title: pageType.charAt(0).toUpperCase() + pageType.slice(1), description: `${pageType} page` },
      sections,
    };
  }

  private getComponentName(sectionType: string): string {
    const map: Record<string, string> = {
      hero: 'HeroGradient', features: 'FeaturesGrid', about: 'AboutWithImage',
      testimonials: 'TestimonialsCarousel', pricing: 'PricingThreeColumn',
      cta: 'CtaBanner', contact: 'ContactForm', gallery: 'GalleryGrid',
      team: 'TeamGrid', faq: 'FaqAccordion', stats: 'StatsBar',
      newsletter: 'NewsletterSignup', services: 'FeaturesGrid', process: 'StepsTimeline',
      map: 'MapEmbed', productGrid: 'ProductGrid', categories: 'CategoriesGrid',
      blogList: 'BlogList', portfolio: 'GalleryGrid', caseStudies: 'TestimonialsCarousel',
      values: 'FeaturesGrid', menu: 'FeaturesGrid', menuFull: 'FeaturesGrid',
      specials: 'CtaBanner', reservation: 'ContactForm', hours: 'StatsBar',
      story: 'AboutWithImage', servicesList: 'FeaturesGrid', products: 'ProductGrid',
    };
    return map[sectionType] || 'HeroGradient';
  }

  private getSectionContent(businessName: string, description: string, industry: string): Record<string, any> {
    return {
      hero: {
        heading: `Welcome to ${businessName}`,
        subheading: description || `Your trusted ${industry} partner`,
        content: `Delivering exceptional ${industry} solutions with passion and precision.`,
        ctaText: 'Get Started', ctaLink: '#contact',
        backgroundImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&h=1080&fit=crop',
      },
      features: {
        heading: 'Why Choose Us',
        subheading: 'What sets us apart',
        items: [
          { icon: 'Zap', title: 'Fast & Efficient', description: 'Lightning-fast delivery and execution' },
          { icon: 'Shield', title: 'Reliable & Secure', description: 'Enterprise-grade security and reliability' },
          { icon: 'Users', title: 'Expert Team', description: 'Industry veterans with decades of experience' },
          { icon: 'Award', title: 'Award Winning', description: 'Recognized excellence in our field' },
        ],
      },
      about: {
        heading: `About ${businessName}`,
        content: `${businessName} is a leading ${industry} business dedicated to delivering exceptional value. ${description || 'We combine innovation with expertise to help our clients succeed.'}`,
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
      },
      testimonials: {
        heading: 'What Our Clients Say',
        items: [
          { name: 'Sarah Johnson', role: 'CEO', company: 'TechCorp', content: `Working with ${businessName} has been transformative for our business.`, avatar: '' },
          { name: 'Michael Chen', role: 'Founder', company: 'StartupXYZ', content: 'Exceptional quality and outstanding customer service. Highly recommended.', avatar: '' },
          { name: 'Emily Davis', role: 'Director', company: 'GrowthCo', content: 'They delivered beyond our expectations. A true partner in success.', avatar: '' },
        ],
      },
      pricing: {
        heading: 'Simple, Transparent Pricing',
        subheading: 'Choose the plan that fits your needs',
        items: [
          { name: 'Starter', price: '$29', period: '/month', features: ['Core features', 'Email support', '5 projects'], ctaText: 'Start Free' },
          { name: 'Professional', price: '$79', period: '/month', features: ['All Starter features', 'Priority support', 'Unlimited projects', 'Analytics'], ctaText: 'Get Started', popular: true },
          { name: 'Enterprise', price: '$199', period: '/month', features: ['All Pro features', 'Dedicated manager', 'Custom integrations', 'SLA'], ctaText: 'Contact Sales' },
        ],
      },
      cta: {
        heading: 'Ready to Get Started?',
        content: `Join thousands of satisfied customers who trust ${businessName}.`,
        ctaText: 'Contact Us', ctaLink: '#contact',
      },
      contact: {
        heading: 'Get in Touch',
        subheading: 'We\'d love to hear from you',
        fields: ['name', 'email', 'phone', 'message'],
      },
      stats: {
        items: [
          { value: '500+', label: 'Happy Clients' },
          { value: '1000+', label: 'Projects Completed' },
          { value: '50+', label: 'Team Members' },
          { value: '99%', label: 'Satisfaction Rate' },
        ],
      },
      team: {
        heading: 'Meet Our Team',
        items: [
          { name: 'Alex Rivera', role: 'CEO & Founder', image: '' },
          { name: 'Jordan Kim', role: 'CTO', image: '' },
          { name: 'Taylor Wright', role: 'Head of Design', image: '' },
          { name: 'Morgan Lee', role: 'Lead Developer', image: '' },
        ],
      },
      faq: {
        heading: 'Frequently Asked Questions',
        items: [
          { question: `What services does ${businessName} offer?`, answer: `We offer comprehensive ${industry} solutions tailored to your needs.` },
          { question: 'How do I get started?', answer: 'Simply contact us through our form or schedule a free consultation.' },
          { question: 'What is your pricing?', answer: 'We offer flexible pricing plans to fit businesses of all sizes.' },
          { question: 'Do you offer support?', answer: 'Yes, we provide 24/7 support for all our clients.' },
        ],
      },
      newsletter: {
        heading: 'Stay Updated',
        content: 'Subscribe to our newsletter for the latest news and updates.',
        ctaText: 'Subscribe',
      },
    };
  }

  private async createJob(tenantId: string, type: string, input: Record<string, unknown>) {
    // Map short type names to Prisma enum values
    const typeMap: Record<string, string> = {
      'WEBSITE': 'WEBSITE_GENERATION', 'PAGE': 'PAGE_GENERATION',
      'SECTION': 'SECTION_GENERATION', 'CONTENT': 'CONTENT_GENERATION',
      'IMAGE': 'IMAGE_GENERATION',
    };
    const mappedType = typeMap[type] || type;

    const job = await prisma.aiJob.create({
      data: {
        id: generateId(),
        tenantId,
        userId: (input.userId as string) || 'system',
        type: mappedType as any,
        status: 'PENDING',
        input: input as any,
      },
    });

    return job;
  }

  private calculateCredits(type: string): number {
    const creditMap: Record<string, number> = {
      WEBSITE_GENERATION: 50, WEBSITE_REGENERATION: 50,
      PAGE_GENERATION: 10, SECTION_GENERATION: 5,
      CONTENT_GENERATION: 3, IMAGE_GENERATION: 8,
      SEO_OPTIMIZATION: 5,
    };
    return creditMap[type] || 5;
  }
}

export const aiService = new AiService();

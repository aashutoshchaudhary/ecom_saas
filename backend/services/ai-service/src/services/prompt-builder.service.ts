export class PromptBuilderService {
  buildPrompt(type: string, input: Record<string, unknown>): string {
    switch (type) {
      case 'WEBSITE':
        return this.buildWebsitePrompt(input);
      case 'PAGE':
        return this.buildPagePrompt(input);
      case 'SECTION':
        return this.buildSectionPrompt(input);
      case 'CONTENT':
        return this.buildContentPrompt(input);
      case 'IMAGE':
        return this.buildImagePrompt(input);
      default:
        return this.buildGenericPrompt(input);
    }
  }

  private buildWebsitePrompt(input: Record<string, unknown>): string {
    const industry = input.industry as string || 'general';
    const businessName = input.businessName as string || 'Business';
    const description = input.description as string || '';

    const industryContext = this.getIndustryContext(industry);

    return `Generate a complete website structure for a ${industry} business.
Business Name: ${businessName}
Description: ${description}

${industryContext}

Requirements:
- Create a professional, modern website structure
- Include appropriate pages for the industry (${this.getIndustryPages(industry).join(', ')})
- Each page should have relevant sections with placeholder content
- Include SEO meta titles and descriptions
- Use industry-appropriate color scheme suggestions
- Output as JSON with structure: { pages: [{ name, slug, sections: [{ type, content }] }], theme: { colors, fonts } }`;
  }

  private buildPagePrompt(input: Record<string, unknown>): string {
    const pageType = input.pageType as string || 'landing';
    const industry = input.industry as string || 'general';

    return `Generate a ${pageType} page for a ${industry} website.

Requirements:
- Create sections appropriate for a ${pageType} page
- Include compelling headlines and body copy
- Add call-to-action elements
- Output as JSON with structure: { name, slug, sections: [{ type, heading, content, cta }] }`;
  }

  private buildSectionPrompt(input: Record<string, unknown>): string {
    const sectionType = input.sectionType as string || 'hero';
    const industry = input.industry as string || 'general';

    return `Generate a ${sectionType} section for a ${industry} website.

Requirements:
- Create compelling content for the ${sectionType} section
- Include appropriate headings, body text, and CTAs
- Output as JSON with structure: { type, heading, subheading, content, cta, images }`;
  }

  private buildContentPrompt(input: Record<string, unknown>): string {
    const topic = input.topic as string || '';
    const tone = input.tone as string || 'professional';
    const length = input.length as string || 'medium';

    return `Write ${length} ${tone} content about: ${topic}

Requirements:
- Use a ${tone} tone
- Length: ${length === 'short' ? '100-200' : length === 'long' ? '500-800' : '200-400'} words
- Include a compelling headline
- Use proper formatting with paragraphs`;
  }

  private buildImagePrompt(input: Record<string, unknown>): string {
    const prompt = input.prompt as string || '';
    const style = input.style as string || 'professional';

    return `${prompt}, ${style} style, high quality, suitable for business website`;
  }

  private buildGenericPrompt(input: Record<string, unknown>): string {
    return `Generate content based on: ${JSON.stringify(input)}`;
  }

  private getIndustryContext(industry: string): string {
    const contexts: Record<string, string> = {
      ecommerce: 'E-commerce business selling products online. Focus on product showcasing, shopping experience, and trust signals.',
      restaurant: 'Restaurant or food service business. Focus on menu, ambiance, reservations, and location.',
      booking: 'Service-based business with appointment booking. Focus on services, availability, and easy booking.',
      events: 'Event management or venue business. Focus on upcoming events, venue details, and ticketing.',
      donation: 'Non-profit or charitable organization. Focus on mission, impact, and donation process.',
      services: 'Professional services business. Focus on expertise, portfolio, testimonials, and contact.',
      retail: 'Retail business with physical and/or online presence. Focus on products, store locations, and promotions.',
    };
    return contexts[industry] || 'General business website with standard sections.';
  }

  private getIndustryPages(industry: string): string[] {
    const pageMap: Record<string, string[]> = {
      ecommerce: ['Home', 'Products', 'Categories', 'About', 'Contact', 'FAQ'],
      restaurant: ['Home', 'Menu', 'About', 'Reservations', 'Gallery', 'Contact'],
      booking: ['Home', 'Services', 'Book Now', 'About', 'Testimonials', 'Contact'],
      events: ['Home', 'Events', 'Venue', 'About', 'Gallery', 'Contact'],
      donation: ['Home', 'Our Mission', 'Programs', 'Donate', 'Impact', 'Contact'],
      services: ['Home', 'Services', 'Portfolio', 'About', 'Testimonials', 'Contact'],
      retail: ['Home', 'Products', 'Store Locations', 'About', 'Promotions', 'Contact'],
    };
    return pageMap[industry] || ['Home', 'About', 'Services', 'Contact'];
  }
}

export const promptBuilderService = new PromptBuilderService();

import { SectionConfig } from "@/lib/api";

/**
 * Dynamic section renderer.
 * Maps section type strings to server-rendered React components.
 * Each section is fully responsive and adapts to all screen sizes.
 */

interface SectionRendererProps {
  section: SectionConfig;
  colorScheme?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

export function SectionRenderer({ section, colorScheme }: SectionRendererProps) {
  const { type, props } = section;
  const p = props as Record<string, any>;

  switch (type) {
    case "hero-gradient":
      return <HeroGradient {...p} />;
    case "hero-image":
      return <HeroImage {...p} />;
    case "hero-video":
      return <HeroVideo {...p} />;
    case "features-grid":
      return <FeaturesGrid {...p} />;
    case "features-cards":
      return <FeaturesCards {...p} />;
    case "testimonials-grid":
      return <TestimonialsGrid {...p} />;
    case "pricing-3tier":
      return <Pricing3Tier {...p} />;
    case "cta-centered":
      return <CTACentered {...p} />;
    case "cta-split":
      return <CTASplit {...p} />;
    case "contact-form":
      return <ContactForm {...p} />;
    case "gallery-grid":
      return <GalleryGrid {...p} />;
    case "team-grid":
      return <TeamGrid {...p} />;
    case "stats-4col":
      return <Stats4Col {...p} />;
    case "product-grid-3":
      return <ProductGrid {...p} columns={3} />;
    case "product-grid-4":
      return <ProductGrid {...p} columns={4} />;
    default:
      return (
        <div className="py-12 px-4 text-center text-gray-400 text-sm">
          Section type &quot;{type}&quot; is not yet supported in the renderer.
        </div>
      );
  }
}

// ─── Hero Sections ───────────────────────────────────────────────────────────

function HeroGradient({
  title,
  subtitle,
  ctaText,
  ctaLink,
  backgroundGradient = "from-purple-600 to-blue-600",
}: any) {
  return (
    <section className={`relative bg-gradient-to-r ${backgroundGradient} text-white`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 md:py-36 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
          {title}
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 opacity-90 max-w-3xl mx-auto">
          {subtitle}
        </p>
        {ctaText && (
          <a
            href={ctaLink || "#"}
            className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base"
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  );
}

function HeroImage({ title, subtitle, ctaText, ctaLink, image }: any) {
  return (
    <section className="relative min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh] lg:min-h-[80vh] overflow-hidden flex items-center">
      {image && (
        <img
          src={image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
      )}
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-white">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
          {title}
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto">
          {subtitle}
        </p>
        {ctaText && (
          <a
            href={ctaLink || "#"}
            className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  );
}

function HeroVideo({ title, subtitle, ctaText, ctaLink }: any) {
  return (
    <section className="relative min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh] overflow-hidden bg-gray-900 flex items-center">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-blue-900/50" />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-white">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
          {title}
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto">
          {subtitle}
        </p>
        {ctaText && (
          <a
            href={ctaLink || "#"}
            className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  );
}

// ─── Feature Sections ────────────────────────────────────────────────────────

const iconMap: Record<string, string> = {
  sparkles: "\u2728",
  zap: "\u26a1",
  shield: "\ud83d\udee1\ufe0f",
  globe: "\ud83c\udf10",
  star: "\u2b50",
  heart: "\u2764\ufe0f",
  rocket: "\ud83d\ude80",
  check: "\u2705",
  lock: "\ud83d\udd12",
  chart: "\ud83d\udcca",
  users: "\ud83d\udc65",
  code: "\ud83d\udcbb",
};

function FeaturesGrid({ title, subtitle, features = [] }: any) {
  return (
    <section className="py-16 sm:py-20 md:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">{title}</h2>
          {subtitle && (
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
          )}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((f: any, i: number) => (
            <div key={i} className="text-center p-4 sm:p-6">
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">
                {iconMap[f.icon] || f.icon || "\u2728"}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-sm sm:text-base text-gray-600">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesCards({ title, subtitle, features = [] }: any) {
  return (
    <section className="py-16 sm:py-20 md:py-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">{title}</h2>
          {subtitle && (
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
          )}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((f: any, i: number) => (
            <div
              key={i}
              className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl sm:text-4xl mb-3">{iconMap[f.icon] || f.icon || "\u2728"}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ────────────────────────────────────────────────────────────

function TestimonialsGrid({ title, testimonials = [] }: any) {
  return (
    <section className="py-16 sm:py-20 md:py-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10 sm:mb-14">
          {title}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((t: any, i: number) => (
            <div key={i} className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.rating || 5 }).map((_, j) => (
                  <span key={j} className="text-yellow-400 text-sm">\u2605</span>
                ))}
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-4">&quot;{t.content}&quot;</p>
              <div className="flex items-center gap-3">
                {t.avatar && (
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover"
                    loading="lazy"
                  />
                )}
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  {t.role && <p className="text-xs text-gray-500">{t.role}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ─────────────────────────────────────────────────────────────────

function Pricing3Tier({ title, plans = [] }: any) {
  return (
    <section className="py-16 sm:py-20 md:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10 sm:mb-14">
          {title}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {plans.map((plan: any, i: number) => (
            <div
              key={i}
              className={`rounded-xl p-5 sm:p-6 border-2 ${
                plan.popular
                  ? "border-purple-500 shadow-xl"
                  : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <span className="inline-block bg-purple-600 text-white text-xs px-3 py-1 rounded-full mb-3 font-semibold">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <div className="text-3xl sm:text-4xl font-bold my-3">{plan.price}</div>
              <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
              <a
                href={plan.ctaLink || "#"}
                className="block w-full text-center px-4 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm"
              >
                {plan.ctaText || "Get Started"}
              </a>
              {plan.features && (
                <ul className="mt-5 space-y-2">
                  {plan.features.map((f: string, j: number) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <span className="text-green-500">\u2713</span> {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Sections ────────────────────────────────────────────────────────────

function CTACentered({ title, subtitle, ctaText, ctaLink }: any) {
  return (
    <section className="py-16 sm:py-20 md:py-24 px-4">
      <div className="max-w-3xl mx-auto text-center bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 sm:p-10 md:p-14 text-white">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 opacity-90 max-w-xl mx-auto">
            {subtitle}
          </p>
        )}
        {ctaText && (
          <a
            href={ctaLink || "#"}
            className="inline-flex items-center px-6 sm:px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base"
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  );
}

function CTASplit({ title, subtitle, ctaText, ctaLink, image }: any) {
  return (
    <section className="py-16 sm:py-20 md:py-24 px-4">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">{title}</h2>
          {subtitle && <p className="text-sm sm:text-base text-gray-600 mb-6">{subtitle}</p>}
          {ctaText && (
            <a
              href={ctaLink || "#"}
              className="inline-flex items-center px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors text-sm"
            >
              {ctaText}
            </a>
          )}
        </div>
        {image && (
          <div className="rounded-xl overflow-hidden">
            <img src={image} alt="" className="w-full h-auto" loading="lazy" />
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Contact ─────────────────────────────────────────────────────────────────

function ContactForm({ title, subtitle, fields = [] }: any) {
  const defaultFields = fields.length > 0 ? fields : ["name", "email", "message"];
  return (
    <section className="py-16 sm:py-20 md:py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">{title || "Contact Us"}</h2>
          {subtitle && <p className="text-sm sm:text-base text-gray-600">{subtitle}</p>}
        </div>
        <form className="space-y-4">
          {defaultFields.includes("name") && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Name</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm"
                placeholder="Your name"
              />
            </div>
          )}
          {defaultFields.includes("email") && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm"
                placeholder="you@example.com"
              />
            </div>
          )}
          {defaultFields.includes("message") && (
            <div>
              <label className="block text-sm font-medium mb-1.5">Message</label>
              <textarea
                rows={5}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm resize-y"
                placeholder="How can we help?"
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors text-sm"
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}

// ─── Gallery ─────────────────────────────────────────────────────────────────

function GalleryGrid({ title, images = [] }: any) {
  return (
    <section className="py-16 sm:py-20 md:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {title && (
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10 sm:mb-14">
            {title}
          </h2>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {images.map((img: any, i: number) => (
            <div key={i} className="rounded-xl overflow-hidden aspect-square">
              <img
                src={typeof img === "string" ? img : img.src}
                alt={typeof img === "string" ? "" : img.alt || ""}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Team ────────────────────────────────────────────────────────────────────

function TeamGrid({ title, members = [] }: any) {
  return (
    <section className="py-16 sm:py-20 md:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10 sm:mb-14">
          {title || "Our Team"}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {members.map((m: any, i: number) => (
            <div key={i} className="text-center">
              {m.avatar && (
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-3 object-cover"
                  loading="lazy"
                />
              )}
              <h3 className="font-semibold text-sm sm:text-base">{m.name}</h3>
              {m.role && <p className="text-xs sm:text-sm text-gray-500">{m.role}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Stats ───────────────────────────────────────────────────────────────────

function Stats4Col({ title, stats = [] }: any) {
  return (
    <section className="py-16 sm:py-20 md:py-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {title && (
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10 sm:mb-14">
            {title}
          </h2>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((s: any, i: number) => (
            <div key={i} className="text-center p-4 sm:p-6">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-purple-600 mb-1">
                {s.value}
              </div>
              <p className="text-sm sm:text-base text-gray-600">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Products ────────────────────────────────────────────────────────────────

function ProductGrid({ title, products = [], columns = 3 }: any) {
  const colClass =
    columns === 4
      ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section className="py-16 sm:py-20 md:py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {title && (
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-10 sm:mb-14">
            {title}
          </h2>
        )}
        <div className={`grid ${colClass} gap-4 sm:gap-6`}>
          {products.map((p: any, i: number) => (
            <div key={i} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              {p.image && (
                <div className="aspect-square overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-sm sm:text-base">{p.name}</h3>
                {p.price && (
                  <p className="text-purple-600 font-bold mt-1">{p.price}</p>
                )}
                {p.description && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">{p.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

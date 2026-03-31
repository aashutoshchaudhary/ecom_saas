import { SiteStructure } from "@/lib/api";

interface SiteHeaderProps {
  structure: SiteStructure;
}

export function SiteHeader({ structure }: SiteHeaderProps) {
  const { header, colorScheme } = structure;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 flex-shrink-0">
            {header.logo ? (
              <img
                src={header.logo}
                alt={header.logoText}
                className="h-7 sm:h-8 w-auto"
              />
            ) : (
              <span
                className="font-bold text-lg sm:text-xl"
                style={{ color: colorScheme.primary }}
              >
                {header.logoText}
              </span>
            )}
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {header.navigation.map((item) => (
              <a
                key={item.path}
                href={item.path}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                {item.label}
              </a>
            ))}
            {header.ctaText && (
              <a
                href={header.ctaLink || "#"}
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors"
                style={{ backgroundColor: colorScheme.primary }}
              >
                {header.ctaText}
              </a>
            )}
          </div>

          {/* Mobile menu button */}
          <details className="md:hidden relative">
            <summary className="list-none cursor-pointer p-2 -mr-2">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </summary>
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
              {header.navigation.map((item) => (
                <a
                  key={item.path}
                  href={item.path}
                  className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {item.label}
                </a>
              ))}
              {header.ctaText && (
                <div className="px-3 pt-2 pb-1 border-t border-gray-100 mt-2">
                  <a
                    href={header.ctaLink || "#"}
                    className="block w-full text-center px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors"
                    style={{ backgroundColor: colorScheme.primary }}
                  >
                    {header.ctaText}
                  </a>
                </div>
              )}
            </div>
          </details>
        </div>
      </nav>
    </header>
  );
}

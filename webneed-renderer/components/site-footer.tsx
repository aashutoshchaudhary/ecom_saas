import { SiteStructure } from "@/lib/api";

interface SiteFooterProps {
  structure: SiteStructure;
}

export function SiteFooter({ structure }: SiteFooterProps) {
  const { footer, colorScheme } = structure;

  return (
    <footer className="border-t border-gray-200 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 text-center sm:text-left">
            {footer.text}
          </p>
          {footer.links.length > 0 && (
            <div className="flex items-center gap-4 sm:gap-6">
              {footer.links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="mt-4 text-center">
          <a
            href="https://siteforge.app"
            className="text-xs text-gray-400 hover:text-gray-500 transition-colors"
          >
            Powered by SiteForge AI
          </a>
        </div>
      </div>
    </footer>
  );
}

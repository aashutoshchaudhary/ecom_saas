export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl sm:text-8xl font-bold text-gray-200 mb-4">404</h1>
        <h2 className="text-xl sm:text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-6 text-sm sm:text-base">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <a
          href="/"
          className="inline-flex items-center px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors text-sm"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}

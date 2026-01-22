import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-6">
        <Link
          href="/"
          className="text-xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Consulting Framer
        </Link>
      </header>

      {/* Centered content */}
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 p-6 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Consulting Framer. All rights reserved.</p>
      </footer>
    </div>
  );
}

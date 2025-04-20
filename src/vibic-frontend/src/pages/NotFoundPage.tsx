import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Sorry, we couldn't find the page you were looking for.
        </p>
        <Link
          to="/channels/@me"
          className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-500 transition"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}

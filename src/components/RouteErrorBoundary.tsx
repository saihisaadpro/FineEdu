import { useRouteError, isRouteErrorResponse } from 'react-router';
import { AlertTriangle, RefreshCw, Home, WifiOff } from 'lucide-react';

/**
 * Check if an error looks like a stale-chunk / network import failure.
 */
function isChunkError(error: unknown): boolean {
  if (error instanceof TypeError || error instanceof Error) {
    const msg = error.message;
    return (
      msg.includes('dynamically imported module') ||
      msg.includes('Failed to fetch') ||
      msg.includes('Loading chunk') ||
      msg.includes('Loading CSS chunk') ||
      msg.includes('error loading dynamically imported module') ||
      msg.includes('Importing a module script failed')
    );
  }
  return false;
}

/**
 * Check if the error is a network connectivity issue.
 */
function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return error.message === 'Failed to fetch' || error.message.includes('NetworkError');
  }
  return false;
}

/**
 * Production-ready error boundary for React Router routes.
 * Handles chunk-loading failures, network errors, 404s, and unexpected errors
 * with a user-friendly recovery UI.
 */
export function RouteErrorBoundary() {
  const error = useRouteError();

  const chunkError = isChunkError(error);
  const networkError = !chunkError && isNetworkError(error);
  const is404 = isRouteErrorResponse(error) && error.status === 404;
  const is403 = isRouteErrorResponse(error) && error.status === 403;

  const handleReload = () => {
    // Clear any stale service-worker caches for the HTML shell
    if ('caches' in window) {
      caches.keys().then(names =>
        names.forEach(name => caches.delete(name)),
      );
    }
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  if (is404) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={handleGoHome}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    );
  }

  if (is403) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          You don't have permission to view this page.
        </p>
        <button
          onClick={handleGoHome}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    );
  }

  if (networkError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-6">
          <WifiOff className="w-8 h-8 text-slate-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Connection Problem</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          Unable to reach the server. Check your internet connection and try again.
        </p>
        <button
          onClick={handleReload}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8 text-red-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {chunkError ? 'New Version Available' : 'Something Went Wrong'}
      </h1>
      <p className="text-gray-600 mb-8 max-w-md">
        {chunkError
          ? 'The app has been updated since you last loaded it. A quick refresh will get you back on track.'
          : 'An unexpected error occurred. Please try refreshing the page.'}
      </p>
      <div className="flex gap-3">
        <button
          onClick={handleReload}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          {chunkError ? 'Load Latest Version' : 'Try Again'}
        </button>
        <button
          onClick={handleGoHome}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          <Home className="w-4 h-4" />
          Home
        </button>
      </div>
    </div>
  );
}

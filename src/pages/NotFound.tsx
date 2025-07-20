/**
 * NotFound.tsx
 *
 * 404 error page for Fintrack GenZ Vision.
 * - Displays user-friendly message and link to home.
 * - Logs attempted route for debugging and analytics.
 *
 * Dependencies:
 * - react-router-dom: useLocation for route info
 * - UI primitives: none (uses divs and Tailwind classes)
 *
 * Edge Cases & Limitations:
 * - Only handles client-side routing errors.
 * - No backend error handling.
 *
 * TODO: Add error reporting and accessibility improvements.
 */

import { useLocation } from "react-router-dom";
import { useEffect } from "react";

/**
 * NotFound
 * Renders 404 error page and logs attempted route.
 * @returns {JSX.Element} 404 page UI
 */
const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;

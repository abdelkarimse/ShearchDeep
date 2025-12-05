import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

/**
 * Loading Spinner Component
 */
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Verifying authentication...
        </p>
      </div>
    </div>
  );
}

/**
 * ProtectedRoute Component
 * 
 * Protects routes by checking:
 * 1. If user is authenticated
 * 2. If user has the required role (if specified)
 * 
 * Redirects to:
 * - /login if not authenticated (saves intended destination)
 * - /unauthorized if authenticated but wrong role
 */
export function ProtectedRoute({ 
  children, 
  allowedRoles,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Not authenticated - redirect to login with return URL
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check role-based access
  if (allowedRoles && user) {
    const hasRequiredRole = allowedRoles.includes(user.role);
    
    if (!hasRequiredRole) {
      // Authenticated but unauthorized - redirect to unauthorized page
      return (
        <Navigate 
          to="/unauthorized" 
          state={{ attemptedPath: location.pathname }} 
          replace 
        />
      );
    }
  }

  // All checks passed - render protected content
  return <>{children}</>;
}

/**
 * AdminRoute - Shorthand for admin-only routes
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * UserRoute - Shorthand for user-only routes
 */
export function UserRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['user']}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * PublicOnlyRoute - Redirects authenticated users away (e.g., login page)
 */
interface PublicOnlyRouteProps {
  children: React.ReactNode;
}

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // If authenticated, redirect to appropriate dashboard
  if (isAuthenticated && user) {
    // Check if there's a saved destination
    const from = location.state?.from;
    
    if (from) {
      return <Navigate to={from} replace />;
    }
    
    // Redirect based on role
    const redirectPath = user.role === 'admin' 
      ? '/admin/dashboard' 
      : '/client/dashboard';
    
    return <Navigate to={redirectPath} replace />;
  }

  // Not authenticated - show public content
  return <>{children}</>;
}

/**
 * RoleBasedRedirect - Redirects based on user role
 */
export function RoleBasedRedirect() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on role
  const redirectPath = user?.role === 'admin' 
    ? '/admin/dashboard' 
    : '/client/dashboard';

  return <Navigate to={redirectPath} replace />;
}

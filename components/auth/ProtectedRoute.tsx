'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/stores/auth/AuthStore';
import Link from 'next/link';
import {  FaLock } from 'react-icons/fa';
import AdminLoader from '@/components/loader/Loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];      // Role(s) required to access
  requiredPermissions?: string[];         // Permissions required
  requireAllPermissions?: boolean;         // If true, needs ALL permissions, if false needs ANY
  redirectTo?: string;                     // Custom login redirect
  fallback?: React.ReactNode;              // Custom unauthorized UI
  showLoading?: boolean;                    // Show loading spinner
}

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  requiredPermissions = [],
  requireAllPermissions = true,
  redirectTo = '/login',
  fallback,
  showLoading = true
}: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [accessStatus, setAccessStatus] = useState<'authorized' | 'unauthorized' | 'unauthenticated'>('unauthenticated');
  
  const { user, isAuthenticated, refreshAccessToken, hasPermission, hasRole } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Step 1: Check authentication
        if (!isAuthenticated && !user) {
          const refreshed = await refreshAccessToken();
          if (!refreshed) {
            setAccessStatus('unauthenticated');
            setIsLoading(false);
            return;
          }
        }

        // Get user data
        // Step 2: Check role requirements
        if (requiredRole) {
          if (!hasRole(requiredRole)) {
            setAccessStatus('unauthorized');
            setIsLoading(false);
            return;
          }
        }

        // Step 3: Check permission requirements
        if (requiredPermissions.length > 0) {
          if (!hasPermission(requiredPermissions, requireAllPermissions)) {
            setAccessStatus('unauthorized');
            setIsLoading(false);
            return;
          }
        }

        // All checks passed
        setAccessStatus('authorized');
      } catch (error) {
        console.error('Access check failed:', error);
        setAccessStatus('unauthenticated');
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [isAuthenticated, user, refreshAccessToken, requiredRole, requiredPermissions, requireAllPermissions, hasPermission, hasRole]);

  // Handle redirects
  useEffect(() => {
    if (!isLoading) {
      if (accessStatus === 'unauthenticated') {
        router.replace(redirectTo);
      } else if (accessStatus === 'unauthorized') {
        router.replace('/unauthorized');
      }
    }
  }, [isLoading, accessStatus, router, redirectTo]);

  if (isLoading && showLoading) {
    return (
      <AdminLoader
        title="Verifying Access"
        message="Checking your session and permission rules for this page."
        hint="This usually completes in a moment."
      />
    );
  }

  // Show nothing while redirecting
  if (isLoading) {
    return null;
  }

  // Show unauthorized fallback if provided
  if (accessStatus === 'unauthorized' && fallback) {
    return <>{fallback}</>;
  }

  // Render children if authorized
  if (accessStatus === 'authorized') {
    return <>{children}</>;
  }

  // Return null while redirecting
  return null;
}

// Pre-built Unauthorized component
export function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <FaLock className="h-12 w-12 text-red-600" />
          </div>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
          Access Denied
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          You don&apos;t have permission to access this page.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => window.history.back()}
            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Go Back
          </button>
          <Link
            href="/"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

// Pre-built Loading component
export function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
  return (
    <AdminLoader
      title="Loading"
      message={message}
      hint="Please wait while the page prepares your data."
    />
  );
}

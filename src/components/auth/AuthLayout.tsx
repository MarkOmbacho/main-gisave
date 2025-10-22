import { useAuth } from '@/hooks/useAuth';
import { Navigate, Outlet } from 'react-router-dom';

interface AuthLayoutProps {
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthLayout({ 
  requireAuth = false, 
  redirectTo = '/auth' 
}: AuthLayoutProps) {
  const { user, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    );
  }

  // Redirect if authentication requirement not met
  if (requireAuth && !user) {
    return <Navigate to={redirectTo} />;
  }

  if (!requireAuth && user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="container relative min-h-screen grid flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <img src="/logo.png" alt="Logo" className="mr-2 h-8 w-8" />
          Girls I Save
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Join our community of mentors and mentees dedicated to empowering the next generation of female leaders."
            </p>
            <footer className="text-sm">Sofia Davis</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

type Role = "USER" | "ADMIN";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: Role[];
  loadingComponent?: React.ReactNode;
  unauthorizedComponent?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  roles = ["USER", "ADMIN"],
  loadingComponent = (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ),
  unauthorizedComponent = (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Unauthorized</h1>
      <p className="text-gray-600 mb-4">
        You don't have permission to access this page.
      </p>
      <button
        onClick={() => window.location.href = "/"}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Go to Home
      </button>
    </div>
  ),
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      const callbackUrl = encodeURIComponent(router.asPath);
      router.push(`/auth/signin?callbackUrl=${callbackUrl}`);
    }
  }, [status, router]);

  if (status === "loading") {
    return <>{loadingComponent}</>;
  }

  if (status === "unauthenticated") {
    return null; // Redirecting in useEffect
  }

  // Check if user has required role
  const hasRequiredRole = session?.user?.role && roles.includes(session.user.role);

  if (!hasRequiredRole) {
    return <>{unauthorizedComponent}</>;
  }

  return <>{children}</>;
}

export function withAuth(
  Component: React.ComponentType<any>,
  roles: Role[] = ["USER", "ADMIN"]
) {
  return function WithAuth(props: any) {
    return (
      <ProtectedRoute roles={roles}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

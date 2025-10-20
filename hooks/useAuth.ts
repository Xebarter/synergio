import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

// Extend the default user type to include the role property
interface ExtendedUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

export const useAuth = (required = false) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  useEffect(() => {
    if (!isLoading && !isAuthenticated && required) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(router.asPath)}`);
    }
  }, [isLoading, isAuthenticated, required, router]);

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/auth/signin");
  };

  return {
    user: session?.user as ExtendedUser | undefined,
    isLoading,
    isAuthenticated,
    signOut: handleSignOut,
  };
};

export const useAdmin = () => {
  const { user, ...rest } = useAuth(true);
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/unauthorized");
    }
  }, [user, router]);

  return {
    user: user?.role === "ADMIN" ? user : null,
    ...rest,
  };
};
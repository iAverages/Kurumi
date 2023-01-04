import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { type ReactNode, useEffect } from "react";

const publicRoutes = ["/login", "/error"] as const;

const isPublicRoute = (currentRoute: string) => {
    for (const route of publicRoutes) {
        if (currentRoute.startsWith(route)) return true;
    }
    return false;
};

const Auth: React.FC<{ children: ReactNode }> = ({ children }) => {
    const session = useSession();
    const router = useRouter();

    useEffect(() => {
        if (!router.isReady || isPublicRoute(router.pathname)) return;
        if (session.status === "unauthenticated") {
            signIn();
        }
    }, [session.status, router]);

    return <>{children}</>;
};

export default Auth;

import { Spinner } from "@chakra-ui/react";
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

const OnlyAuthenticated: React.FC<{ children: ReactNode }> = ({ children }) => {
    const session = useSession();
    const router = useRouter();

    useEffect(() => {
        if (!router.isReady) return;
        if (session.status === "unauthenticated") {
            signIn();
        }
        if (session.status === "authenticated" && router.pathname === "/login") {
            router.push("/");
        }
    }, [session.status, router]);

    if ((session.status === "unauthenticated" || session.status === "loading") && !isPublicRoute(router.pathname))
        return <Spinner />;

    if (session.status === "authenticated" && router.pathname === "/login") return <Spinner />;

    return <>{children}</>;
};

export default OnlyAuthenticated;

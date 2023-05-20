import { Spinner } from "@chakra-ui/react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { type ReactNode, useEffect } from "react";
import PageSpinner from "./PageSpinner";

const publicRoutes = ["/login", "/error"] as const;

const isPublicRoute = (currentRoute: string) => {
    for (const route of publicRoutes) {
        if (currentRoute.startsWith(route)) return true;
    }
    return false;
};

const OnlyAuthenticated: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated" && router.pathname !== "/login") {
            signIn();
            return;
        }

        if (status === "authenticated" && router.pathname.startsWith("/login")) {
            router.push("/");
        }
    }, [status, router]);

    if (status === "authenticated") return <>{children}</>;

    if (status === "unauthenticated" && router.pathname.startsWith("/login")) {
        return <>{children}</>;
    }

    return null;
    //     if (!router.isReady) return;
    //     if (session.status === "loading") return;
    //     if (session.status === "unauthenticated") {
    //         signIn();
    //     }
    //     if (session.status === "authenticated" && router.pathname === "/login") {
    //         router.push("/");
    //     }
    // }, [session.status, router]);

    // if ((session.status === "unauthenticated" || session.status === "loading") && !isPublicRoute(router.pathname))
    //     return <PageSpinner />;

    // if (session.status === "authenticated" && router.pathname === "/login") return <PageSpinner />;

    // if (session.status === "loading") return <PageSpinner />;

    return <>{children}</>;
};

export default OnlyAuthenticated;

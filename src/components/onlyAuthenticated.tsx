import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { type ReactNode, useEffect } from "react";

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
};

export default OnlyAuthenticated;

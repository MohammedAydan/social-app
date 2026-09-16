"use client";

import Loading from "~/shared/components/loading";
import { useAuth } from "../hooks/use-auth";
import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

interface InitialLoadingProps {
    children: ReactNode;
}

const AuthLayout = ({ children }: InitialLoadingProps) => {
    const { initialLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const publicRoutes = ["/sign-in", "/register", "/forgot-password", "/reset-password"];
    const isPublicPage = publicRoutes.includes(pathname);

    useEffect(() => {
        if (!initialLoading) {
            if (!isAuthenticated && !isPublicPage) {
                router.replace("/sign-in");
            } else if (isAuthenticated && isPublicPage) {
                router.replace("/");
            }
        }
    }, [initialLoading, isAuthenticated, pathname, router, isPublicPage]);

    if (initialLoading || (!isAuthenticated && !isPublicPage)) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <p className="text-6xl font-bold text-primary">SOCIAL</p>
                    <Loading size="30px" />
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default AuthLayout;

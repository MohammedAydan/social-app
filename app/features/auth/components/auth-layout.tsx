import Loading from "~/shared/components/loading";
import { useAuth } from "../hooks/use-auth";
import { useEffect, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";

interface InitialLoadingProps {
    children: ReactNode;
}

const AuthLayout = ({ children }: InitialLoadingProps) => {
    const { initialLoading, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const pathname = location.pathname;
    const publicRoutes = ["/sign-in", "/register"];
    const isPublicPage = publicRoutes.includes(pathname);

    useEffect(() => {
        if (!initialLoading) {
            if (!isAuthenticated && !isPublicPage) {
                navigate("/sign-in", { replace: true });
            } else if (isAuthenticated && isPublicPage) {
                navigate("/", { replace: true });
            }
        }
    }, [initialLoading, isAuthenticated, pathname, navigate, isPublicPage]);

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
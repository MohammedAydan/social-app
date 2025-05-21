import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { ModeToggle } from "./mode-toggle";

const Header = () => {
    const { isAuthenticated } = useAuth();

    return (
        <header className="fixed top-0 left-0 right-0 w-full h-16 md:px-8 px-3 flex justify-between items-center border-b z-30 bg-background/5 backdrop-blur-xl shadow-sm">
            <Link to="/" className="flex items-center gap-2" aria-label="Home">
                <span className="font-bold text-2xl text-primary tracking-wide">SOCIAL</span>
            </Link>
            <nav className="flex md:gap-4 gap-1">
                {!isAuthenticated && (
                    <>
                        <Link to="/sign-in" tabIndex={0} aria-label="Sign In">
                            <Button variant="default" className="px-6 py-2 rounded-md shadow">
                                Sign In
                            </Button>
                        </Link>
                        <Link to="/register" tabIndex={0} aria-label="Register">
                            <Button variant="outline" className="px-6 py-2 rounded-md">
                                Register
                            </Button>
                        </Link>
                    </>
                )}
                <ModeToggle />
            </nav>
        </header>
    );
};

export default Header;
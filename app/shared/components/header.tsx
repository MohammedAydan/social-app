import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { ModeToggle } from "./mode-toggle";
import { LogIn, UserPlus } from "lucide-react";

const Header = () => {
    const { isAuthenticated } = useAuth();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 w-full h-16 px-4 md:px-8 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-lg shadow-md transition-colors">
            {/* Logo / Branding */}
            <Link
                to="/"
                className="flex items-center gap-2 group"
                aria-label="Home"
            >
                <span className="text-2xl md:text-3xl font-black text-primary tracking-tight transition-colors group-hover:text-primary-foreground flex items-center gap-2">
                    SOCIAL
                    <span className="text-[10px] md:text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold tracking-widest group-hover:bg-primary/40 shadow transition-colors">
                        Beta
                    </span>
                </span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-2 md:gap-4">
                {!isAuthenticated && (
                    <div className="flex items-center gap-2 md:gap-4">
                        <Link to="/sign-in" aria-label="Sign In">
                            <Button
                                variant="default"
                                className="flex items-center gap-2 px-4 py-2 md:px-6 text-base font-semibold rounded-lg shadow-sm transition-all"
                            >
                                <span className="hidden sm:inline">Sign In</span>
                                <LogIn className="inline sm:hidden" size={20} />
                            </Button>
                        </Link>
                        <Link to="/register" aria-label="Register">
                            <Button
                                variant="outline"
                                className="flex items-center gap-2 px-4 py-2 md:px-6 border-primary/40 text-base font-semibold rounded-lg hover:bg-primary/10 transition-all"
                            >
                                <span className="hidden sm:inline">Register</span>
                                <UserPlus className="inline sm:hidden" size={20} />
                            </Button>
                        </Link>
                    </div>
                )}
                <ModeToggle />
            </nav>
        </header>
    );
};

export default Header;

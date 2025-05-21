import {
    Home,
    Bell,
    Search,
    Plus,
    LogOut,
    UserRound,
    Menu,
    X
} from 'lucide-react';
import { Link } from 'react-router';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '~/components/ui/dropdown-menu';
import { useAuth } from '~/features/auth/hooks/use-auth';
import UserAvatar from '~/shared/components/user-avatar';

const SideBar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const [open, setOpen] = useState(false);

    if(!isAuthenticated) return;

    return (
        <>
            {/* Open Button (Small Screens Only) */}
            {!open && (
                <Button
                    onClick={() => setOpen(true)}
                    className="fixed top-20 left-4 z-10 md:hidden"
                    variant="outline"
                    size="icon"
                >
                    <Menu size={20} />
                </Button>
            )}

            {/* Sidebar */}
            <div
                className={`
          fixed top-0 left-0 h-screen w-16 p-3 border-r border-border  bg-background/5 backdrop-blur-xl
          flex flex-col justify-between items-center z-20
          transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        `}
            >
                {/* Close Button (Only visible on small screens) */}
                <div className="mt-20">
                    <Button onClick={() => setOpen(false)} size="icon" variant="ghost" className='md:hidden'>
                        <X size={20} />
                    </Button>
                </div>

                {/* Top Icons */}
                <div className="flex flex-col mt-16 pb-16">
                    <Link to="/post/add">
                        <Button className="w-10 h-10 rounded-full bg-primary mb-4 flex justify-center items-center">
                            <Plus size={20} />
                        </Button>
                    </Link>

                    <Link to="/">
                        <Button className="w-10 h-10 rounded-full bg-foreground/50 mb-4 flex justify-center items-center">
                            <Home size={20} />
                        </Button>
                    </Link>

                    <Link to="/notifications">
                        <Button className="w-10 h-10 rounded-full bg-foreground/50 mb-4 flex justify-center items-center">
                            <Bell size={20} />
                        </Button>
                    </Link>

                    <Link to="/search">
                        <Button className="w-10 h-10 rounded-full bg-foreground/50 mb-4 flex justify-center items-center">
                            <Search size={20} />
                        </Button>
                    </Link>
                </div>

                {/* Avatar & Dropdown */}
                <div className="my-3">
                    {isAuthenticated && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="rounded-full w-[47px] h-[47px]"
                                >
                                    <UserAvatar
                                        url={user?.profileImageUrl}
                                        username={user?.userName}
                                        size={34}
                                    />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <Link to="/profile">
                                    <DropdownMenuItem>
                                        <UserRound className="mr-2" />
                                        Profile
                                    </DropdownMenuItem>
                                </Link>
                                <DropdownMenuItem
                                    onClick={logout}
                                    className="text-red-500 focus:text-red-500"
                                >
                                    <LogOut className="mr-2" />
                                    Sign Out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
        </>
    );
};

export default SideBar;
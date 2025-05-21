import React, {
    createContext,
    useState,
    useCallback,
    useContext,
    useEffect,
    useMemo,
} from "react";
import type { ReactNode } from "react";
import type { CreateUserType } from "~/shared/types/create-user-type";
import type { UserType } from "~/shared/types/user-type";
import { getCurrentUser } from "~/shared/api/api.user";
import {
    getAccessToken,
    removeAccessToken,
} from "~/shared/utils/token";
import {
    AuthService,
    type IAuthService,
} from "../services/auth-service";

interface AuthContextType {
    user: UserType | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    initialLoading: boolean;
    errorMessage: string | null;
    errors: string[] | null;
    setErrorMessage: (error: string | null) => void;
    setErrors: (errors: string[] | null) => void;
    setLoading: (loading: boolean) => void;
    setUser: (user: UserType | null) => void;
    setIsAuthenticated: (authenticated: boolean) => void;
    register: (userData: CreateUserType) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    incrementFollowingCount: () => void;
    decrementFollowingCount: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const authService: IAuthService = new AuthService();

    const [user, setUser] = useState<UserType | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [errors, setErrors] = useState<string[] | null>(null);

    const login = useCallback(async (email: string, password: string) => {
        setLoading(true);
        setErrorMessage(null);
        setErrors(null);
        try {
            const response = await authService.signIn({ email, password });

            if (!response.success) {
                setErrorMessage(response.message ?? "Login failed.");
                setErrors(response.errors ?? null);
                return; // Exit early
            }

            const currentUser = response.data?.user;
            if (!currentUser) throw new Error("User data missing in login response.");

            setUser(currentUser);
            setIsAuthenticated(true);
        } catch (err: any) {
            setErrorMessage(err.message || "Login error");
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async (userData: CreateUserType) => {
        setLoading(true);
        setErrorMessage(null);
        setErrors(null);
        try {
            const response = await authService.register(userData);

            if (!response.success) {
                setErrorMessage(response.message ?? "Registration failed.");
                setErrors(response.errors ?? null);
                return;
            }

            const currentUser = response.data?.user;
            if (!currentUser) throw new Error("User data missing in registration response.");

            setUser(currentUser);
            setIsAuthenticated(true);
        } catch (err: any) {
            setErrorMessage(err.message || "Registration error");
        } finally {
            setLoading(false);
        }
    }, []);


    const checkAuth = useCallback(async () => {
        try {
            setInitialLoading(true);
            const token = getAccessToken();
            if (!token) throw new Error("No token found.");

            const userData = await getCurrentUser();
            const currentUser = userData?.data;

            if (!currentUser) throw new Error("No user data found.");

            setUser(currentUser);
            setIsAuthenticated(true);
        } catch {
            removeAccessToken();
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setInitialLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            setLoading(true);
            await authService.signOut();
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const incrementFollowingCount = () =>
        setUser(prev =>
            prev ? { ...prev, followingCount: (prev.followingCount || 0) + 1 } : null
        );

    const decrementFollowingCount = () =>
        setUser(prev =>
            prev ? { ...prev, followingCount: Math.max((prev.followingCount || 0) - 1, 0) } : null
        );

    const contextValue = useMemo(
        () => ({
            user,
            isAuthenticated,
            isLoading,
            initialLoading,
            errorMessage,
            errors,
            setErrorMessage,
            setErrors,
            setLoading,
            setUser,
            setIsAuthenticated,
            register,
            login,
            logout,
            checkAuth,
            incrementFollowingCount,
            decrementFollowingCount,
        }),
        [
            user,
            isAuthenticated,
            isLoading,
            initialLoading,
            errorMessage,
            errors,
            login,
            register,
            logout,
            checkAuth,
        ]
    );

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthProvider };

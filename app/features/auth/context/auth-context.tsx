"use client";

import React, {
    createContext,
    useState,
    useCallback,
    useContext,
    useEffect,
} from "react";
import type { ReactNode } from "react";

import type { AuthResponseType } from "~/shared/types/auth-response-type";
import type { CreateUserType } from "~/shared/types/create-user-type";
import type { UserType } from "~/shared/types/user-type";

import { getCurrentUser } from "~/shared/api/api.user";
import { getAccessToken, removeAccessToken } from "~/shared/utils/token";

import { AuthService, type IAuthService } from "../services/auth-service";

interface AuthContextType {
    user: UserType | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    initialLoading: boolean;
    error: string | null;
    setError: (error: string | null) => void;
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

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const authService: IAuthService = new AuthService();

    const [user, setUser] = useState<UserType | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const login = useCallback(async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authService.signIn({ email, password });
            if (!response.user) throw new Error("No user data received.");
            setUser(response.user);
            setIsAuthenticated(true);
        } catch (err: any) {
            const message = err?.response?.data?.message || err.message || "Login failed.";
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async (userData: CreateUserType) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authService.register(userData);
            if (!response.user) throw new Error("No user data received.");
            setUser(response.user);
            setIsAuthenticated(true);
        } catch (err: any) {
            const message = err?.response?.data?.message || err.message || "Registration failed.";
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    const checkAuth = useCallback(async () => {
        setInitialLoading(true);
        setError(null);
        try {
            const token = getAccessToken();
            if (!token) throw new Error("No token found.");

            const userData = await getCurrentUser();
            setUser(userData.data);
            setIsAuthenticated(true);
        } catch (err: any) {
            removeAccessToken();
            setUser(null);
            setIsAuthenticated(false);
            setError(err.message || "Failed to check authentication.");
        } finally {
            setInitialLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        setLoading(true);
        try {
            await authService.signOut();
            setUser(null);
            setIsAuthenticated(false);
        } catch (err: any) {
            const message = err.message || "Logout failed.";
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const incrementFollowingCount = useCallback(() => {
        if (user) {
            setUser({ ...user, followingCount: (user.followingCount || 0) + 1 });
        }
    }, [user]);

    const decrementFollowingCount = useCallback(() => {
        if (user) {
            setUser({ ...user, followingCount: Math.max((user.followingCount || 0) - 1, 0) });
        }
    }, [user]);

    const contextValue: AuthContextType = {
        user,
        isAuthenticated,
        isLoading,
        initialLoading,
        error,
        setError,
        setLoading,
        setUser,
        setIsAuthenticated,
        register,
        login,
        logout,
        checkAuth,
        incrementFollowingCount,
        decrementFollowingCount,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthProvider, AuthContext };

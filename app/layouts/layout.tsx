import React, { type ReactNode } from 'react'
import { ThemeProvider, useTheme } from '~/shared/components/theme-provider'
import SideBar from './side-bar'
import Header from '~/shared/components/header'
import AuthProviderAndLayout from '~/features/auth/components/auth-provider'
import { Toaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MediaProvider } from '~/features/feed/hooks/use-manage-media'

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            retry: 1,
        },
        mutations: {
            retry: 0,
        },
    }
});

/** Toaster needs the theme from inside ThemeProvider (hooks can't run above it). */
const ThemedToaster = () => {
    const { theme } = useTheme();
    return <Toaster theme={theme as "light" | "dark" | "system"} />;
};

const GlobalLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider defaultTheme="dark" storageKey="theme-mode">
                    <AuthProviderAndLayout>
                        <Header />
                        <SideBar />
                        <MediaProvider>
                            {children}
                        </MediaProvider>
                    </AuthProviderAndLayout>
                    <ThemedToaster />
                </ThemeProvider>
            </QueryClientProvider>
        </div>
    )
}

export default GlobalLayout
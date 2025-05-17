import React, { type ReactNode } from 'react'
import { ThemeProvider, useTheme } from '~/shared/components/theme-provider'
import SideBar from './side-bar'
import Header from '~/shared/components/header'
import AuthProviderAndLayout from '~/features/auth/components/auth-provider'
import { Toaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
        }
    }
});

const GlobalLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider defaultTheme="dark" storageKey="theme-mode">
                    <AuthProviderAndLayout>
                        <Header />
                        <SideBar />
                        {children}
                    </AuthProviderAndLayout>
                    <Toaster theme={useTheme().theme} />
                </ThemeProvider>
            </QueryClientProvider>
        </div>
    )
}

export default GlobalLayout
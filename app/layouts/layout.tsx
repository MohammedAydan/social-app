"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "~/shared/components/theme-provider";
import SideBar from "./side-bar";
import Header from "~/shared/components/header";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MediaProvider } from "~/features/feed/hooks/use-manage-media";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

export default function GlobalLayout({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="theme-mode">
        <Header />
        <SideBar />
        <MediaProvider>{children}</MediaProvider>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

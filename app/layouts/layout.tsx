"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "~/shared/components/theme-provider";
import SideBar from "./side-bar";
import Header from "~/shared/components/header";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MediaProvider } from "~/features/feed/hooks/use-manage-media";

export default function GlobalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { refetchOnWindowFocus: false } },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="theme-mode">
        <Header />
        <SideBar />
        <main className={pathname === "/" || pathname === "/feed" ? "min-h-screen" : "min-h-screen pt-16"}>
          <MediaProvider>{children}</MediaProvider>
        </main>
        <Toaster position="top-center" richColors />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

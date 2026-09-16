import type { Metadata } from "next";
import "./app.css";
import Providers from "./providers";
import GlobalLayout from "./layouts/layout";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Social App",
    template: "%s | Social App",
  },
  description: "A modern social network for sharing posts and connecting with people.",
  openGraph: {
    type: "website",
    title: "Social App",
    description: "Share ideas and connect with your community.",
    siteName: "Social App",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <GlobalLayout>{children}</GlobalLayout>
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./app.css";
import Providers from "./providers";
import GlobalLayout from "./layouts/layout";

export const metadata: Metadata = {
  title: "Social App",
  description: "A modern social network for sharing posts and connecting with people.",
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

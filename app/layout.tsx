import type { Metadata } from "next";
import "./app.css";

export const metadata: Metadata = {
  title: "Social App",
  description: "A modern social network for sharing posts and connecting with people.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

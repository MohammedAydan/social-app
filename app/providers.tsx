"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "~/features/auth/context/auth-context";

export default function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

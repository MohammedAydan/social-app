"use client";

import type { ReactNode } from "react";
import AuthProviderAndLayout from "~/features/auth/components/auth-provider";

export default function Providers({ children }: { children: ReactNode }) {
  return <AuthProviderAndLayout>{children}</AuthProviderAndLayout>;
}

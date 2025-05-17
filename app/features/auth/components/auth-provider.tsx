import type { ReactNode } from "react";
import { AuthProvider } from "../context/auth-context";
import AuthLayout from "./auth-layout";

interface AuthProviderAndLayoutProps {
  children: ReactNode;
}

const AuthProviderAndLayout = ({ children }: AuthProviderAndLayoutProps) => {
  return (
    <AuthProvider>
      <AuthLayout>{children}</AuthLayout>
    </AuthProvider>
  );
};

export default AuthProviderAndLayout;

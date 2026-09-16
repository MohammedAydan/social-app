import { Suspense } from "react";
import ResetPasswordPage from "~/features/auth/pages/reset-password-page";

export default function ResetPasswordRoute() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPage />
    </Suspense>
  );
}

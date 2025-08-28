import type { MetaArgs } from "react-router";
import ResetPasswordPage from "~/features/auth/pages/reset-password-page";

export function meta({ }: MetaArgs) {
    return [
        { title: "Feed Page" },
        { name: "description", content: "Feed Page" }
    ]
}

export default function ResetPassword() {
    return <ResetPasswordPage />;
}
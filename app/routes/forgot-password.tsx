import type { MetaArgs } from "react-router";
import ForgotPasswordPage from "~/features/auth/pages/forgot-password-page";

export function meta({ }: MetaArgs) {
    return [
        { title: "Feed Page" },
        { name: "description", content: "Feed Page" }
    ]
}

export default function ForgotPassword() {
    return <ForgotPasswordPage />;
}
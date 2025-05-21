import type { MetaArgs } from "react-router";
import SignInPage from "~/features/auth/pages/sign-in-page";

export function meta({ }: MetaArgs) {
    return [
        { title: "Sign In" },
        { name: "description", content: "Sign In Page" }
    ]
}

export default function SignIn() {
    return <SignInPage />
}
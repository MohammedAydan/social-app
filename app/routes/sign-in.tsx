import SignInPage from "~/features/auth/pages/sign-in-page";
import type { Route } from "./+types/home";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Sign In" },
        { name: "description", content: "Sign In Page" }
    ]
}

export default function SignIn() {
    return <SignInPage />
}
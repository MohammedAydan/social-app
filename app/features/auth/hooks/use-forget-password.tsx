import { useState } from "react";
import { toast } from "sonner";
import { forgetPassword } from "~/shared/api";

export const useForgetPassword = () => {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            toast.error("Invalid email", { description: "Please enter a valid email address." });
            return;
        }

        setLoading(true);
        try {
            const response = await forgetPassword({ email });
            if (response.success === true) {
                setSubmitted(true);
                toast.success("Reset link sent", { description: "Check your email for the password reset link." });
            } else {
                setError(response.message || "Failed to send reset link.");
                toast.error("Failed", { description: response.message || "Failed to send reset link." });
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
            toast.error("Error", { description: "Something went wrong. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    const validateEmail = (email: string): boolean => {
        // Basic email regex
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    return {
        email,
        loading,
        error,
        submitted,
        handleSubmit,
        validateEmail,
        setEmail,
    };
}
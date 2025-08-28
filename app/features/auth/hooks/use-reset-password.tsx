import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { resetPassword } from "~/shared/api";

export const useResetPassword = ({ tokenFromParams, emailFromParams }: { tokenFromParams: string, emailFromParams: string }) => {
    const [token, setToken] = useState(tokenFromParams || "");
    const [email, setEmail] = useState(emailFromParams || "");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<string[] | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        setToken(tokenFromParams || "");
        setEmail(emailFromParams || "");
        if (!tokenFromParams || !emailFromParams) {
            navigate("/sign-in", {
                replace: true,
            });
        }
    }, [tokenFromParams, emailFromParams]);

    const validatePassword = (current: string, newPass: string, confirmPass: string): boolean => {
        const errorsList: string[] = [];
        const hasLetter = /[A-Za-z]/.test(newPass);
        const hasNumber = /\d/.test(newPass);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;/]/.test(newPass);
        const arabicYa = /[ى]/g;
        const arabicHamza = /[ؤ]/g;

        // New password
        if (!newPass || newPass.trim().length === 0) {
            errorsList.push("Please enter your new password.");
        } else {
            if (newPass.length < 8) {
                errorsList.push("Password must be at least 8 characters long.");
            }
            if (!hasLetter) {
                errorsList.push("Password must include at least one letter.");
            }
            if (!hasNumber) {
                errorsList.push("Password must include at least one number.");
            }
            if (!hasSpecial) {
                errorsList.push("Password must include at least one special character.");
            }
            if (!/[A-Z]/.test(newPass)) {
                errorsList.push("Password must include at least one uppercase letter.");
            }
            if (!/[a-z]/.test(newPass)) {
                errorsList.push("Password must include at least one lowercase letter.");
            }
            if (/\s/.test(newPass)) {
                errorsList.push("Password must not contain spaces.");
            }
            if (current && newPass.includes(current)) {
                errorsList.push("Password must not contain your previous password.");
            }
            if (newPass.match(arabicYa) && newPass.match(arabicHamza)) {
                errorsList.push("Password cannot contain both 'ى' and 'ؤ' characters together.");
            }
            if (newPass.match(arabicYa) && newPass.match(/[ي]/g)) {
                errorsList.push("Password cannot contain both 'ى' and 'ي' characters together.");
            }
            if (newPass.includes("ى") && !newPass.includes("ؤى")) {
                errorsList.push("If password contains 'ى', it must also contain 'ؤى'.");
            }
            if (newPass.includes("ؤ") && newPass.includes("ى")) {
                errorsList.push("Password cannot contain both 'ؤ' and 'ى' characters together.");
            }
            if (/^(.)\1+$/.test(newPass)) {
                errorsList.push("Password cannot be a single repeated character.");
            }
            if (newPass.toLowerCase().includes("password")) {
                errorsList.push("Password cannot contain the word 'password'.");
            }
        }
        // Confirm password
        if (!confirmPass || confirmPass.trim().length === 0) {
            errorsList.push("Please confirm your new password.");
        } else if (newPass !== confirmPass) {
            errorsList.push("Passwords do not match.");
        }
        setErrors(errorsList.length > 0 ? errorsList : null);
        return errorsList.length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setErrors(null);

        // if (!validateEmail(email)) {
        //     setError("Invalid email address.");
        //     toast.error("Invalid email", { description: "Please enter a valid email address." });
        //     return;
        // }
        // if (email !== emailFromParams) {
        //     setError("The email does not match the reset link.");
        //     toast.error("Email mismatch", { description: "The email does not match the reset link." });
        //     return;
        // }
        if (!validatePassword("", password, confirmPassword)) {
            toast.error("Password requirements not met", { description: "Please review the password requirements and try again." });
            return;
        }
        setLoading(true);
        try {
            const response = await resetPassword({ email: email, token, password, confirmPassword });
            if (response.success === true) {
                setSubmitted(true);
                toast.success("Password reset successful!", { description: "Your password has been reset. You can now sign in with your new password." });
                navigate("/sign-in", {
                    replace: true,
                });
            } else {
                setError(response.message || "Unable to reset password. Please try again later.");
                toast.error("Reset failed", { description: response.message || "Unable to reset password. Please try again later." });
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
            toast.error("Error", { description: "An unexpected error occurred. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    // const validateEmail = (email: string): boolean => {
    //     // Basic email regex
    //     const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //     return re.test(email);
    // };

    return {
        email,
        loading,
        error,
        errors,
        submitted,
        handleSubmit,
        // validateEmail,
        setPassword,
        setConfirmPassword,
        setToken,
        password,
        confirmPassword,
    };
}
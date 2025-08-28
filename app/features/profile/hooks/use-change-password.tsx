import { useState } from "react";
import { toast } from "sonner";
import { changePassword } from "~/shared/api";

export const useChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<string[] | null>(null);

    const handleChangePassword = async () => {
        setLoading(true);
        setErrors(null);
        try {
            if (!validation({ c: currentPassword, n: newPassword, cn: confirmPassword })) {
                setLoading(false);
                return;
            }
            const response = await changePassword({
                currentPassword,
                newPassword,
                confirmPassword
            });
            const errorEntries = Object.entries(response.errors ?? {});
            if (errorEntries.length > 0) {
                const errorsList: string[] = [];
                errorEntries.reverse().forEach(([field, messages]) => {
                    if (Array.isArray(messages)) {
                        errorsList.push(`${field}: ${messages.join(", ")}`);
                    } else if (typeof messages === "string") {
                        errorsList.push(`${field}: ${messages}`);
                    }
                });
                setErrors(errorsList);
                toast.error("Password change failed", { description: errorsList.join("\n") });
                return;
            }
            if (response.success == null || response.success === false) {
                setErrors([response.message]);
                toast.error("Password change failed", { description: response.message });
                return;
            }
            if (response.success) {
                setErrors([response.message]);
                setOpen(false);
                toast.success("Password changed successfully", { description: response.message });
                return;
            }
        } catch (error) {
            // console.error('Update failed:', error);
            setErrors(['Failed to change password. Please try again.']);
            toast.error("Password change failed", { description: "Failed to change password. Please try again." });
        } finally {
            setLoading(false);
        }
    }

    const validation = ({ c, n, cn }: { c: string, n: string, cn: string }): boolean => {
        const errorsList: string[] = [];

        // Helper regexes
        const hasLetter = /[A-Za-z]/.test(n);
        const hasNumber = /\d/.test(n);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;/]/.test(n);
        const arabicYa = /[ى]/g;
        const arabicHamza = /[ؤ]/g;

        // Current password
        if (!c || c.trim().length === 0) {
            errorsList.push("Current password is required.");
        }

        // New password
        if (!n || n.trim().length === 0) {
            errorsList.push("New password is required.");
        } else {
            if (n.length < 8) {
                errorsList.push("New password must be at least 8 characters long.");
            }
            if (!hasLetter) {
                errorsList.push("New password must contain at least one letter.");
            }
            if (!hasNumber) {
                errorsList.push("New password must contain at least one number.");
            }
            if (!hasSpecial) {
                errorsList.push("New password must contain at least one special character.");
            }
            if (!/[A-Z]/.test(n)) {
                errorsList.push("New password must contain at least one uppercase letter.");
            }
            if (!/[a-z]/.test(n)) {
                errorsList.push("New password must contain at least one lowercase letter.");
            }
            if (/\s/.test(n)) {
                errorsList.push("New password must not contain spaces.");
            }
            if (n.includes(c)) {
                errorsList.push("New password must not contain your current password.");
            }
            // Arabic character rules
            if (n.match(arabicYa) && n.match(arabicHamza)) {
                errorsList.push("Password must not contain both 'ى' and 'ؤ' together.");
            }
            if (n.match(arabicYa) && n.match(/[ي]/g)) {
                errorsList.push("Password must not contain both 'ى' and 'ي' together.");
            }
            // Custom: 'ى' == 'ؤى'
            if (n.includes("ى") && !n.includes("ؤى")) {
                errorsList.push("If password contains 'ى', it must also contain 'ؤى'.");
            }
            // Custom: 'ؤ' != 'ى'
            if (n.includes("ؤ") && n.includes("ى")) {
                errorsList.push("'ؤ' and 'ى' must not be together in the password.");
            }
            // Add more strict rules if needed
            if (/^(.)\1+$/.test(n)) {
                errorsList.push("Password must not be a repeated single character.");
            }
            if (n.toLowerCase().includes("password")) {
                errorsList.push("Password must not contain the word 'password'.");
            }
        }

        // Confirm password
        if (!cn || cn.trim().length === 0) {
            errorsList.push("Confirm password is required.");
        } else if (n !== cn) {
            errorsList.push("New password and confirm password do not match.");
        }

        setErrors(errorsList.length > 0 ? errorsList : null);
        return errorsList.length === 0;
    }


    return {
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        open,
        setOpen,
        loading,
        setLoading,
        errors,
        setErrors,
        handleChangePassword
    };
}
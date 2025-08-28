import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { useResetPassword } from "../hooks/use-reset-password";

const ResetPasswordPage = () => {
    // Get email and token from URL query params
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email") || "";
    const tokenParam = params.get("token") || "";
    const {
        email,
        loading,
        error,
        errors,
        submitted,
        handleSubmit,
        setPassword,
        setConfirmPassword,
        password,
        confirmPassword,
    } = useResetPassword({ emailFromParams: emailParam, tokenFromParams: tokenParam });

    if (!emailParam || !tokenParam) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-full max-w-md rounded-lg shadow-md p-8">
                    <h1 className="text-2xl font-semibold mb-6 text-center">Invalid Reset Link</h1>
                    <Separator className="mb-6" />
                    <div className="text-red-600 text-center">
                        The password reset link is invalid or incomplete. Please check your email for the correct link.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md rounded-lg shadow-md p-8">
                <h1 className="text-2xl font-semibold mb-6 text-center">Reset Password</h1>
                <Separator className="mb-6" />
                {submitted ? (
                    <div className="text-green-600 text-center">
                        Your password has been reset successfully. You can now log in with your new password.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <Label htmlFor="password" className="block mb-2">
                                New Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your new password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="py-6 border-input bg-background text-foreground focus:ring-2 focus:ring-primary"
                                disabled={loading}
                            />
                            <Label htmlFor="confirm-password" className="block mb-2">
                                Confirm Password
                            </Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                placeholder="Confirm your new password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="py-6 border-input bg-background text-foreground focus:ring-2 focus:ring-primary"
                                disabled={loading}
                            />
                            {errors && errors.length > 0 && (
                                <div className="text-red-600 mt-2 text-sm">
                                    <ul className="list-disc ml-4">
                                        {errors.map((err: string, idx: number) => (
                                            <li key={idx}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {error && !errors && (
                                <div className="text-red-600 mt-2 text-sm">{error}</div>
                            )}
                        </div>
                        <Button
                            type="submit"
                            className="mt-4 py-6 w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-md transition-all duration-200 hover:shadow-md"
                            aria-label="Send Reset Link"
                            disabled={loading}
                        >
                            {loading ? "Sending..." : "Send Reset Link"}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;

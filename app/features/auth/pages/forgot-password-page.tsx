import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { forgetPassword } from "~/shared/api";
import { useForgetPassword } from "../hooks/use-forget-password";


const ForgotPasswordPage = () => {
    const {
        email,
        loading,
        error,
        submitted,
        handleSubmit,
        setEmail,
    } = useForgetPassword();

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md rounded-lg shadow-md p-8">
                <h1 className="text-2xl font-semibold mb-6 text-center">Forgot Password</h1>
                <Separator className="mb-6" />
                {submitted ? (
                    <div className="text-green-600 text-center">
                        If an account exists for <span className="font-bold">{email}</span>, you will receive a password reset email shortly.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label htmlFor="email" className="block mb-2">
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="py-6 border-input bg-background text-foreground focus:ring-2 focus:ring-primary"
                                disabled={loading}
                            />
                            {error && (
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

export default ForgotPasswordPage;

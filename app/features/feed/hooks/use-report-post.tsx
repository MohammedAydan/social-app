import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { classifyReportError, reportPost } from "~/shared/api/api.posts";

/**
 * Map a report envelope/transport message to user-facing copy.
 * Validation + unknown fall back to the server message (or a generic
 * fallback when the server sent nothing usable).
 */
const toFriendlyMessage = (message?: string | null): string => {
    const serverMessage = message?.trim() ? message!.trim() : "";
    const fallback = serverMessage || "Something went wrong. Please try again.";
    switch (classifyReportError(serverMessage)) {
        case "duplicate":
            return "You've already reported this post. Our team will review it.";
        case "self":
            return "You can't report your own post.";
        case "not-found":
            return "This post is no longer available.";
        case "validation":
            return fallback;
        case "auth":
            return "Please sign in again.";
        case "unknown":
        default:
            return fallback;
    }
};

/**
 * Report-another-user's-post mutation.
 *
 * Wraps the raw `reportPost` facade in its own `useMutation` — the generated
 * `usePostApiPostsPostIdReport` hook is query-style/inverted (posts-sdk
 * ADR pattern), so it must never be used here.
 */
export const useReportPost = (postId: string) => {
    const mutation = useMutation({
        mutationFn: ({ reason, details }: { reason: string; details?: string | null }) =>
            reportPost(postId, { reason, details: details ?? null }),
        onSuccess: (response) => {
            if (!response.success) {
                toast.error("Failed to submit report", {
                    description: toFriendlyMessage(response.message),
                });
                return;
            }
            toast.success("Report submitted");
        },
        onError: (error) => {
            toast.error("Failed to submit report", {
                description:
                    error instanceof Error && error.message
                        ? error.message
                        : "Something went wrong. Please try again.",
            });
        },
    });

    /** Submit a report; resolves with the envelope (never throws on envelope errors). */
    const report = (reason: string, details?: string | null) =>
        mutation.mutateAsync({ reason, details: details ?? null });

    return {
        ...mutation,
        report,
        isPending: mutation.isPending,
        error: mutation.error,
    };
};

export type UseReportPost = ReturnType<typeof useReportPost>;

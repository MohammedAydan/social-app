import { useState, type ReactNode } from "react";
import { Button } from "~/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { REPORT_REASONS } from "~/shared/api/api.posts";
import Loading from "~/shared/components/loading";
import { useReportPost } from "../hooks/use-report-post";

const DEFAULT_REASON = "Spam";

const isOtherReason = (reason: string) => reason.toLowerCase() === "other";

interface ReportPostDialogProps {
    postId: string;
    /** Optional trigger element (rendered via DialogTrigger). Omit for controlled use. */
    trigger?: ReactNode;
    /** Controlled open state — when omitted the dialog manages its own state. */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSubmitted?: () => void;
}

/**
 * Report-post dialog: reason Select (server reasons, default Spam) + details
 * Textarea. `details` is required when reason is Other (client-guarded with an
 * inline error). Render OUTSIDE any DropdownMenu content (sibling) — the
 * Radix Dialog portals its content out, but the trigger/state must not live
 * inside the menu. Follows the delete-post dialog styling pattern.
 */
const ReportPostDialog = ({
    postId,
    trigger,
    open: controlledOpen,
    onOpenChange,
    onSubmitted,
}: ReportPostDialogProps) => {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const open = controlledOpen ?? uncontrolledOpen;
    const setOpen = onOpenChange ?? setUncontrolledOpen;

    const [reason, setReason] = useState(DEFAULT_REASON);
    const [details, setDetails] = useState("");
    const [detailsError, setDetailsError] = useState<string | null>(null);
    const { report, isPending } = useReportPost(postId);

    const resetForm = () => {
        setReason(DEFAULT_REASON);
        setDetails("");
        setDetailsError(null);
    };

    const handleOpenChange = (next: boolean) => {
        if (!next) resetForm();
        setOpen(next);
    };

    const handleSubmit = async () => {
        if (isOtherReason(reason) && !details.trim()) {
            setDetailsError("Please tell us what the issue is.");
            return;
        }
        setDetailsError(null);
        try {
            const response = await report(reason, details.trim() ? details.trim() : null);
            // Envelope failure: the hook already toasted the mapped error — keep
            // the dialog open so the user can adjust and retry.
            if (!response.success) return;
            resetForm();
            setOpen(false);
            onSubmitted?.();
        } catch {
            // Transport failure: the hook already toasted — keep input intact.
        }
    };

    const otherSelected = isOtherReason(reason);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Report post</DialogTitle>
                    <DialogDescription>
                        Let us know what&apos;s wrong with this post. Our team will review it.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                        <Label htmlFor="report-reason">Reason</Label>
                        <Select
                            value={reason}
                            onValueChange={(value) => {
                                setReason(value);
                                setDetailsError(null);
                            }}
                            disabled={isPending}
                        >
                            <SelectTrigger id="report-reason" className="w-full">
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent>
                                {REPORT_REASONS.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="report-details">
                            Details{otherSelected ? " (required)" : " (optional)"}
                        </Label>
                        <Textarea
                            id="report-details"
                            value={details}
                            onChange={(event) => {
                                setDetails(event.target.value);
                                if (detailsError) setDetailsError(null);
                            }}
                            placeholder={
                                otherSelected
                                    ? "Please describe the issue"
                                    : "Add more context (optional)"
                            }
                            disabled={isPending}
                            aria-required={otherSelected}
                            aria-invalid={detailsError ? true : undefined}
                            aria-describedby={detailsError ? "report-details-error" : undefined}
                        />
                        {detailsError ? (
                            <p id="report-details-error" role="alert" className="text-sm text-destructive">
                                {detailsError}
                            </p>
                        ) : null}
                    </div>
                </div>

                <DialogFooter className="flex justify-end gap-2 mt-4">
                    <Button
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isPending}>
                        {isPending ? <Loading size="20px" /> : "Submit report"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ReportPostDialog;

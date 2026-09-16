import { useState } from "react";
import { Ban } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog";
import { useAuth } from "~/features/auth/hooks/use-auth";
import Loading from "~/shared/components/loading";
import { useBlockUser, useIsBlocked } from "../hooks/use-block-user";

interface BlockButtonProps {
    userId: string;
    userName?: string;
    className?: string;
}

/**
 * Block/Unblock button. Hides itself for the current user.
 * Blocking is two-way (ARCHITECTURE.md §2.3): feed/profile/search filter
 * both directions, writes are rejected, notifications suppressed.
 */
const BlockButton = ({ userId, userName, className }: BlockButtonProps) => {
    const { user } = useAuth();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const { data: isBlocked, isLoading: statusLoading } = useIsBlocked(userId);
    const { block, unblock, isPending } = useBlockUser(userId);

    if (!user?.id || user.id === userId) return null;

    if (statusLoading) {
        return (
            <Button variant="outline" className={className} disabled>
                <Loading size="20px" />
            </Button>
        );
    }

    if (isBlocked) {
        return (
            <Button
                variant="outline"
                className={className}
                onClick={unblock}
                disabled={isPending}
            >
                {isPending ? <Loading size="20px" /> : "Unblock"}
            </Button>
        );
    }

    const displayName = userName ? `@${userName}` : "this user";

    return (
        <>
            <Button
                variant="destructive"
                className={className}
                onClick={() => setConfirmOpen(true)}
                disabled={isPending}
            >
                <Ban className="mr-2 h-4 w-4" />
                Block
            </Button>
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Block {displayName}?</DialogTitle>
                        <DialogDescription>
                            You won't see each other's posts, and likes, comments,
                            shares, and follows between you will be rejected.
                            They won't be notified.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={isPending}
                            onClick={() => {
                                block();
                                setConfirmOpen(false);
                            }}
                        >
                            {isPending ? <Loading size="20px" /> : "Block"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default BlockButton;

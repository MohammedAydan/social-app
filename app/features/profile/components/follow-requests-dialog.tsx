import { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "~/components/ui/dialog";
import UserAvatar from "~/shared/components/user-avatar";
import Loading from "~/shared/components/loading";
import { getDisplayName, getHandle } from "~/shared/utils/display-name";
import type { FollowRequestSummary } from "~/shared/types/follow-type";
import {
    useFollowRequestActions,
    usePendingFollowRequests,
} from "../hooks/use-follow-requests";

const FollowRequestsDialog = () => {
    const [open, setOpen] = useState(false);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = usePendingFollowRequests(open);

    const requests = data?.pages.flatMap((p) => p.items) ?? [];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Follow requests
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Follow requests</DialogTitle>
                    <DialogDescription>
                        People waiting for you to accept their follow request.
                    </DialogDescription>
                </DialogHeader>

                {status === "pending" && (
                    <div className="flex justify-center py-8">
                        <Loading size="30px" />
                    </div>
                )}

                {status === "error" && (
                    <div className="text-center py-8">
                        <p className="text-destructive text-sm">Failed to load follow requests.</p>
                        <Button variant="outline" size="sm" className="mt-4" onClick={() => setOpen(false)}>
                            Close
                        </Button>
                    </div>
                )}

                {status === "success" && requests.length === 0 && (
                    <div className="flex flex-col items-center py-8 text-center">
                        <UserPlus className="h-10 w-10 text-muted-foreground/60 mb-3" />
                        <p className="text-muted-foreground text-sm">No pending requests</p>
                    </div>
                )}

                {requests.length > 0 && (
                    <div className="flex flex-col gap-2">
                        {requests.map((r) => (
                            <FollowRequestRow key={r.id} request={r} />
                        ))}
                    </div>
                )}

                {hasNextPage && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        disabled={isFetchingNextPage}
                        onClick={() => fetchNextPage()}
                    >
                        {isFetchingNextPage ? <Loading size="18px" /> : "Load more"}
                    </Button>
                )}
            </DialogContent>
        </Dialog>
    );
};

const FollowRequestRow = ({ request }: { request: FollowRequestSummary }) => {
    const { accept, decline, actingId, isActing } = useFollowRequestActions();
    const busy = isActing && actingId === request.id;
    const displayName = getDisplayName(request);
    const handle = getHandle(request);

    return (
        <div className="flex items-center gap-3 border rounded-lg p-3">
            <UserAvatar
                url={request.profileImageUrl ?? ""}
                username={request.userName}
                displayName={displayName === "Unknown User" ? undefined : displayName}
                size={40}
            />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{displayName}</p>
                {handle && <p className="text-xs text-muted-foreground truncate">{handle}</p>}
            </div>
            <div className="flex gap-2 shrink-0">
                <Button
                    variant="default"
                    size="sm"
                    disabled={busy}
                    onClick={() => accept(request.id)}
                >
                    {busy ? <Loading size="16px" /> : "Accept"}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => decline(request.id)}
                >
                    Decline
                </Button>
            </div>
        </div>
    );
};

export default FollowRequestsDialog;

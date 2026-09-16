import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ShieldX, UserX } from "lucide-react";
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
import { getBlockedUsers } from "~/shared/api/api.block";
import {
    normalizeBlockedUsers,
    type BlockedUserSummary,
} from "~/shared/types/block-user-type";
import { useBlockUser } from "../hooks/use-block-user";
import { BLOCKED_USERS_KEY } from "../hooks/use-block-user";

const PAGE_SIZE = 20;

const BlockedUsersDialog = () => {
    const [open, setOpen] = useState(false);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: BLOCKED_USERS_KEY,
        queryFn: async ({ pageParam = 1 }) => {
            const res = await getBlockedUsers(pageParam, PAGE_SIZE);
            if (!res.success) throw new Error(res.message || "Failed to load blocked users");
            const items = normalizeBlockedUsers(res.data);
            return {
                items,
                nextPage: items.length === PAGE_SIZE ? pageParam + 1 : undefined,
            };
        },
        getNextPageParam: (lastPage) => lastPage.nextPage,
        initialPageParam: 1,
        enabled: open,
    });

    const users = data?.pages.flatMap((p) => p.items) ?? [];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                    <UserX className="mr-2 h-4 w-4" />
                    Blocked users
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Blocked users</DialogTitle>
                    <DialogDescription>
                        People you've blocked can't see your content or interact with you, and vice versa.
                    </DialogDescription>
                </DialogHeader>

                {status === "pending" && (
                    <div className="flex justify-center py-8">
                        <Loading size="30px" />
                    </div>
                )}

                {status === "error" && (
                    <div className="text-center py-8">
                        <p className="text-destructive text-sm">Failed to load blocked users.</p>
                        <Button variant="outline" size="sm" className="mt-4" onClick={() => setOpen(false)}>
                            Close
                        </Button>
                    </div>
                )}

                {status === "success" && users.length === 0 && (
                    <div className="flex flex-col items-center py-8 text-center">
                        <ShieldX className="h-10 w-10 text-muted-foreground/60 mb-3" />
                        <p className="text-muted-foreground text-sm">No blocked users</p>
                    </div>
                )}

                {users.length > 0 && (
                    <div className="flex flex-col gap-2">
                        {users.map((u) => (
                            <BlockedUserRow key={u.id} blocked={u} />
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

const BlockedUserRow = ({ blocked }: { blocked: BlockedUserSummary }) => {
    const { unblock, isUnblocking } = useBlockUser(blocked.id);
    const displayName = getDisplayName(blocked);
    const handle = getHandle(blocked);

    return (
        <div className="flex items-center gap-3 border rounded-lg p-3">
            <UserAvatar
                url={blocked.profileImageUrl ?? ""}
                username={blocked.userName}
                displayName={displayName === "Unknown User" ? undefined : displayName}
                size={40}
            />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{displayName}</p>
                {handle && <p className="text-xs text-muted-foreground truncate">{handle}</p>}
            </div>
            <Button
                variant="outline"
                size="sm"
                disabled={isUnblocking}
                onClick={unblock}
            >
                {isUnblocking ? <Loading size="16px" /> : "Unblock"}
            </Button>
        </div>
    );
};

export default BlockedUsersDialog;

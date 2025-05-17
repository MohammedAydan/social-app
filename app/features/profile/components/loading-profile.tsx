import { Skeleton } from "~/components/ui/skeleton";

const LoadingProfileHeader = () => {
    return (
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mt-6">
            <Skeleton className="w-40 h-40 rounded-full" />
            <div className="flex flex-col gap-4 w-full md:w-auto">
                <Skeleton className="h-8 w-48" />
                <div className="flex gap-8 text-muted-foreground">
                    <StatItemSkeleton />
                    <StatItemSkeleton />
                    <StatItemSkeleton />
                </div>
                <div className="w-full mt-3">
                    <Skeleton className="w-full h-10" />
                </div>
            </div>
        </div>
    );
};

const StatItemSkeleton = () => (
    <div>
        <Skeleton className="inline-block h-5 w-6 mr-1" />
        <Skeleton className="inline-block h-5 w-16" />
    </div>
);

export default LoadingProfileHeader;
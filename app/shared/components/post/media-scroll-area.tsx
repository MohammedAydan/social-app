"use client";
import { useState } from "react";
import { X } from "lucide-react";
import type { Media } from "~/shared/types/post-types";
import { cn } from "~/lib/utils";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";

interface MediaScrollAreaProps {
    media: Media[];
}

export const MediaScrollArea = ({ media }: MediaScrollAreaProps) => {
    const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
    const isSingleMedia = media.length === 1;

    return (
        <ScrollArea
            className={cn(
                "w-full rounded-lg border border-border bg-card",
                isSingleMedia && "overflow-hidden"
            )}
        >
            <div
                className={cn(
                    "flex space-x-4 p-4",
                    isSingleMedia ? "justify-center w-full" : "w-max"
                )}
            >
                {media.map((m, i) => (
                    <Dialog key={m.id} onOpenChange={(open) => !open && setSelectedMedia(null)}>
                        <DialogTrigger asChild>
                            <figure
                                className={cn(
                                    "shrink-0 transition-transform duration-300 cursor-pointer",
                                    isSingleMedia ? "w-full max-w-md" : "w-[260px]",
                                    "hover:scale-105 focus-within:scale-105"
                                )}
                                onClick={() => setSelectedMedia(m)}
                            >
                                <div
                                    className={cn(
                                        "overflow-hidden rounded-md bg-muted shadow-sm",
                                        "flex items-center justify-center relative group",
                                        isSingleMedia ? "h-[400px]" : "h-[340px]"
                                    )}
                                >
                                    {m.type === "image" ? (
                                        <img
                                            src={m.url}
                                            alt={m.name}
                                            className={cn(
                                                "w-full h-full object-cover",
                                                "transition-opacity duration-300 group-hover:opacity-90"
                                            )}
                                            width={isSingleMedia ? 480 : 260}
                                            height={isSingleMedia ? 400 : 340}
                                            loading="lazy"
                                            sizes={isSingleMedia ? "100vw" : "(max-width: 768px) 100vw, 260px"}
                                        />
                                    ) : m.type === "video" ? (
                                        <video
                                            controls
                                            src={m.url}
                                            className="w-full h-full object-cover rounded-md"
                                            aria-label={`Video: ${m.name}`}
                                        />
                                    ) : m.type === "file" ? (
                                        <div
                                            className={cn(
                                                "flex flex-col items-center justify-center text-center p-4 h-full",
                                                "bg-muted/50 rounded-md"
                                            )}
                                        >
                                            <span className="text-3xl mb-2">📄</span>
                                            <span
                                                className={cn(
                                                    "text-sm font-medium text-muted-foreground line-clamp-2"
                                                )}
                                            >
                                                {m.name}
                                            </span>
                                            <a
                                                href={m.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={cn(
                                                    "mt-2 text-xs font-semibold text-primary hover:underline",
                                                    "transition-colors duration-200"
                                                )}
                                                aria-label={`View file: ${m.name}`}
                                            >
                                                View file
                                            </a>
                                        </div>
                                    ) : (
                                        <div
                                            className={cn(
                                                "flex items-center justify-center text-center p-4 h-full",
                                                "bg-muted/50 rounded-md"
                                            )}
                                        >
                                            <span className="text-sm font-medium text-muted-foreground">
                                                ⚠️ Unsupported media type
                                            </span>
                                        </div>
                                    )}
                                    <div
                                        className={cn(
                                            "absolute inset-0 bg-background/0",
                                            "group-hover:bg-background/10 transition-all duration-300"
                                        )}
                                    />
                                </div>
                                <figcaption
                                    className={cn(
                                        "pt-2 text-xs font-medium text-muted-foreground text-center"
                                    )}
                                >
                                    {i + 1} of {media.length}
                                </figcaption>
                            </figure>
                        </DialogTrigger>
                        <DialogContent
                            className={cn(
                                "p-4 bg-card rounded-lg max-w-[90vw] sm:max-w-4xl",
                                "border border-border max-h-[90vh] overflow-y-auto"
                            )}
                        >
                            <DialogClose asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                                    aria-label="Close dialog"
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </DialogClose>
                            <div className="flex items-center justify-center max-h-[80vh] p-4">
                                {selectedMedia?.type === "image" ? (
                                    <img
                                        src={selectedMedia.url}
                                        alt={selectedMedia.name}
                                        className="max-w-full max-h-[80vh] object-contain rounded-md"
                                        width={960}
                                        height={720}
                                        sizes="(max-width: 768px) 100vw, 960px"
                                    />
                                ) : selectedMedia?.type === "video" ? (
                                    <video
                                        controls
                                        autoPlay
                                        src={selectedMedia.url}
                                        className="max-w-full max-h-[80vh] object-contain rounded-md"
                                        aria-label={`Video: ${selectedMedia.name}`}
                                    />
                                ) : selectedMedia?.type === "file" ? (
                                    <div className="bg-muted/50 p-8 rounded-lg text-center max-w-lg w-full">
                                        <span className="text-5xl mb-4 block">📄</span>
                                        <span className="text-lg font-medium text-foreground block mb-4 line-clamp-2">
                                            {selectedMedia.name}
                                        </span>
                                        <a
                                            href={selectedMedia.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={cn(
                                                "text-sm font-semibold text-primary hover:underline",
                                                "transition-colors duration-200"
                                            )}
                                            aria-label={`View file: ${selectedMedia.name}`}
                                        >
                                            View file
                                        </a>
                                    </div>
                                ) : (
                                    <div className="bg-muted/50 p-8 rounded-lg text-center max-w-lg w-full">
                                        <span className="text-sm font-medium text-muted-foreground">
                                            ⚠️ Unsupported media type
                                        </span>
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                ))}
            </div>
            {!isSingleMedia && (
                <ScrollBar
                    orientation="horizontal"
                    className="h-1.5 bg-muted rounded-full"
                />
            )}
        </ScrollArea>
    );
};
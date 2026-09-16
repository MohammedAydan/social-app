"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { X, Download, FileText, ExternalLink, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Media } from "~/shared/types/post-types";
import { cn } from "~/lib/utils";
import { Dialog, DialogClose, DialogContent } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { CustomVideoPlayer } from "./custom-video-player";
import { CustomAudioPlayer } from "./custom-audio-player";
import { CustomImageViewer } from "./custom-image-viewer";

/**
 * MediaScrollArea Component
 * 
 * A modern, responsive media gallery component with custom players
 * Features:
 * - Smart grid layouts based on media count
 * - Custom video/audio players with full controls
 * - Image viewer with zoom/pan/rotate capabilities
 * - Elegant dialog with proper aspect ratios
 * - Performance optimized with React hooks
 */

interface MediaScrollAreaProps {
    media: Media[];
    className?: string;
}

// Media type configuration
const MEDIA_CONFIG = {
    image: { label: "Image" },
    video: { label: "Video" },
    audio: { label: "Audio" },
    file: { label: "Document" }
} as const;

// Mosaic layout: 1 → hero, 2 → split, 3 → wide hero + split row,
// 4+ → even 2×2 (extra items behind a "+N" overlay).
const TILE_HEIGHT_1 = "h-[300px] sm:h-[420px]";
const TILE_HEIGHT_2 = "h-[220px] sm:h-[300px]";
const TILE_HEIGHT_HALF = "h-[180px] sm:h-[220px]";

const tileClass = (index: number, count: number): string => {
    if (count === 1) return TILE_HEIGHT_1;
    if (count === 2) return TILE_HEIGHT_2;
    if (count === 3) return index === 0 ? `col-span-2 h-[220px] sm:h-[280px]` : TILE_HEIGHT_HALF;
    return TILE_HEIGHT_HALF;
};

export const MediaScrollArea = ({ media, className }: MediaScrollAreaProps) => {
    // State management
    const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Computed values
    const mediaCount = useMemo(() => media.length, [media.length]);
    const isMultipleMedia = useMemo(() => mediaCount > 1, [mediaCount]);
    const gridCols = mediaCount === 1 ? "grid-cols-1" : "grid-cols-2";

    // Event handlers
    const handleMediaClick = useCallback((mediaItem: Media, index: number) => {
        setSelectedMedia(mediaItem);
        setCurrentIndex(index);
        setIsDialogOpen(true);
    }, []);

    const handleDialogClose = useCallback(() => {
        setIsDialogOpen(false);
        setSelectedMedia(null);
        setCurrentIndex(0);
    }, []);

    const handleDownload = useCallback((mediaItem: Media) => {
        const link = document.createElement('a');
        link.href = mediaItem.url;
        link.download = mediaItem.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, []);

    const navigateToMedia = useCallback((index: number) => {
        if (index >= 0 && index < media.length) {
            setSelectedMedia(media[index]);
            setCurrentIndex(index);
        }
    }, [media]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isDialogOpen) return;

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                const prevIndex = currentIndex > 0 ? currentIndex - 1 : media.length - 1;
                navigateToMedia(prevIndex);
                break;
            case 'ArrowRight':
                e.preventDefault();
                const nextIndex = currentIndex < media.length - 1 ? currentIndex + 1 : 0;
                navigateToMedia(nextIndex);
                break;
            case 'Escape':
                e.preventDefault();
                handleDialogClose();
                break;
        }
    }, [isDialogOpen, currentIndex, media.length, navigateToMedia, handleDialogClose]);

    // Navigation functions
    const navigatePrev = useCallback(() => {
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : media.length - 1;
        navigateToMedia(prevIndex);
    }, [currentIndex, media.length, navigateToMedia]);

    const navigateNext = useCallback(() => {
        const nextIndex = currentIndex < media.length - 1 ? currentIndex + 1 : 0;
        navigateToMedia(nextIndex);
    }, [currentIndex, media.length, navigateToMedia]);

    // Add keyboard event listeners
    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Thumbnail renderer for grid view
    const renderThumbnail = useCallback((mediaItem: Media) => {
        const alt = mediaItem.name?.trim() || "Post image";
        switch (mediaItem.type) {
            case "image":
                return (
                    <div className="relative group w-full h-full overflow-hidden rounded-xl bg-muted">
                        <img
                            src={mediaItem.thumbnailUrl || mediaItem.url}
                            alt={alt}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            loading="lazy"
                            draggable={false}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    </div>
                );

            case "video":
                // No poster available → gradient placeholder (a video URL as
                // <img> src would render broken). Poster wins when present.
                return mediaItem.thumbnailUrl ? (
                    <div className="relative group w-full h-full overflow-hidden rounded-xl bg-muted">
                        <img
                            src={mediaItem.thumbnailUrl}
                            alt={alt}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            draggable={false}
                        />
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/35 transition-colors duration-300">
                            <div className="bg-background/90 dark:bg-background/90 rounded-full p-3 backdrop-blur-sm shadow-lg border border-border/20">
                                <Play className="h-6 w-6 text-foreground ml-0.5" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="relative w-full h-full overflow-hidden rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 dark:from-zinc-900 dark:to-black flex flex-col items-center justify-center gap-2 p-4">
                        <div className="bg-background/90 rounded-full p-3.5 shadow-lg">
                            <Play className="h-7 w-7 text-foreground ml-0.5" />
                        </div>
                        <span className="text-xs font-medium text-white/80 line-clamp-1 max-w-full px-2">
                            {mediaItem.name || "Video"}
                        </span>
                    </div>
                );

            case "audio":
                return (
                    <div className="w-full h-full bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 rounded-xl flex flex-col items-center justify-center p-4 border border-border/50">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-4 mb-3 shadow-lg">
                            <Play className="h-8 w-8 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-center line-clamp-2 text-foreground">
                            {mediaItem.name}
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">Audio</span>
                    </div>
                );

            case "file":
                return (
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 rounded-xl flex flex-col items-center justify-center p-4 border border-border/50">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full p-4 mb-3 shadow-lg">
                            <FileText className="h-8 w-8 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-center line-clamp-2 text-foreground">
                            {mediaItem.name}
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">Document</span>
                    </div>
                );

            default:
                return (
                    <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted/30 dark:from-muted/30 dark:to-muted/20 rounded-xl flex flex-col items-center justify-center p-4 border border-border/50">
                        <div className="bg-gradient-to-r from-muted-foreground/50 to-muted-foreground/30 rounded-full p-4 mb-3">
                            <X className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <span className="text-sm text-muted-foreground">Unsupported</span>
                    </div>
                );
        }
    }, []);

    // Full-size renderer for dialog view
    const renderFullMedia = useCallback((mediaItem: Media) => {
        switch (mediaItem.type) {
            case "image":
                return (
                    <CustomImageViewer
                        src={mediaItem.url}
                        alt={mediaItem.name}
                        className="w-full h-full"
                        // onDownload={() => handleDownload(mediaItem)}
                    />
                );

            case "video":
                return (
                    <div className="w-full h-full flex items-center justify-center">
                        <CustomVideoPlayer
                            src={mediaItem.url}
                            poster={mediaItem.thumbnailUrl}
                            className="w-full h-full max-w-[90vw] max-h-[70vh] rounded-lg"
                            controls={true}
                            autoPlay={false}
                        />
                    </div>
                );

            case "audio":
                return (
                    <div className="w-full h-full flex items-center justify-center">
                        <CustomAudioPlayer
                            src={mediaItem.url}
                            title={mediaItem.name}
                            className="w-full max-w-md mx-auto"
                        />
                    </div>
                );

            case "file":
                return (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-full max-w-md mx-auto bg-card rounded-xl p-8 text-center border border-border">
                            <div className="bg-primary/10 rounded-full p-6 mb-6 mx-auto w-fit">
                                <FileText className="h-12 w-12 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2 text-foreground">
                                {mediaItem.name}
                            </h3>
                            <p className="text-muted-foreground mb-6 text-sm">
                                Document File
                            </p>
                            <div className="flex gap-3 justify-center">
                                <Button asChild>
                                    <a
                                        href={mediaItem.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2"
                                    >
                                        <ExternalLink className="h-4 w-4" />
                                        Open File
                                    </a>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleDownload(mediaItem)}
                                    className="flex items-center gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Download
                                </Button>
                            </div>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-full max-w-md mx-auto bg-card rounded-xl p-8 text-center border border-border">
                            <div className="bg-muted rounded-full p-6 mb-6 mx-auto w-fit">
                                <X className="h-12 w-12 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2 text-foreground">
                                Unsupported Media
                            </h3>
                            <p className="text-muted-foreground text-sm">
                                This media type is not supported
                            </p>
                        </div>
                    </div>
                );
        }
    }, [handleDownload]);

    return (
        <div className={cn("w-full", className)}>
            {/* Media Grid */}
            <div
                className={cn(
                    "grid gap-1.5 sm:gap-2 w-full rounded-2xl overflow-hidden",
                    gridCols,
                    "bg-muted/30 border border-border/40 p-1.5"
                )}
            >
                {media.slice(0, 4).map((mediaItem, index) => {
                    const isLastItem = index === 3 && media.length > 4;
                    const remainingCount = media.length - 4;
                    const config = MEDIA_CONFIG[mediaItem.type as keyof typeof MEDIA_CONFIG] || MEDIA_CONFIG.file;

                    return (
                        <motion.div
                            key={mediaItem.id}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={cn(
                                "relative cursor-pointer group overflow-hidden rounded-xl",
                                tileClass(index, media.length)
                            )}
                            onClick={() => handleMediaClick(mediaItem, index)}
                        >
                            <div className="w-full h-full">
                                {renderThumbnail(mediaItem)}
                            </div>

                            {/* Overlay for more items */}
                            {isLastItem && remainingCount > 0 && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl backdrop-blur-sm">
                                    <div className="text-white text-center">
                                        <span className="text-3xl font-bold">+{remainingCount}</span>
                                        <p className="text-sm mt-1 opacity-90">more items</p>
                                    </div>
                                </div>
                            )}

                            {/* Media type badge — always visible (touch has no hover) */}
                            {!isLastItem && (
                                <div className="absolute bottom-2 left-2">
                                    <div className="bg-black/65 text-white px-2 py-0.5 rounded-md text-[11px] font-medium backdrop-blur-sm">
                                        {config.label}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Media count indicator */}
            {isMultipleMedia && (
                <div className="flex items-center justify-center mt-2.5">
                    <div className="flex items-center space-x-2 bg-background/80 dark:bg-background/80 border border-border/50 rounded-full px-4 py-2 backdrop-blur-sm">
                        <div className="flex space-x-1">
                            {Array.from({ length: Math.min(media.length, 5) }).map((_, i) => (
                                <div
                                    key={i}
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-colors duration-200",
                                        i === currentIndex ? "bg-primary" : "bg-muted-foreground/40"
                                    )}
                                />
                            ))}
                        </div>
                        {media.length > 5 && (
                            <span className="text-xs text-muted-foreground ml-2">
                                +{media.length - 5} more
                            </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                            {media.length} item{media.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
            )}

            {/* Enhanced Dialog */}
            <AnimatePresence>
                {isDialogOpen && selectedMedia && (
                    <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                        <DialogContent
                            showCloseButton={false}
                            className={cn(
                                "p-0 bg-background/95 dark:bg-background/95 backdrop-blur-md border border-border",
                                "w-[90%] max-w-none h-[95vh] max-h-none md:min-w-[750px] lg:min-w-[950px]",
                                "flex flex-col overflow-hidden rounded-2xl shadow-2xl",
                                "max-w-full w-full min-h-[50vh] sm:min-h-[70vh] md:min-h-[80vh]",
                            )}
                        >
                            {/* Header */}
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center justify-between p-4 bg-background/80 dark:bg-background/80 backdrop-blur-sm border-b border-border"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="text-foreground text-sm font-medium max-w-xs truncate">
                                        {selectedMedia.name?.trim() || "Untitled"}
                                    </div>
                                    <div className="text-muted-foreground text-xs uppercase tracking-wide">
                                        {MEDIA_CONFIG[selectedMedia.type]?.label || 'Unknown'}
                                    </div>
                                    {isMultipleMedia && (
                                        <div className="text-muted-foreground text-xs">
                                            {currentIndex + 1} / {media.length}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    {/* Navigation arrows for multiple media */}
                                    {isMultipleMedia && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                                onClick={navigatePrev}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                                onClick={navigateNext}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                    <DialogClose asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </DialogClose>
                                </div>
                            </motion.div>

                            {/* Media Content */}
                            <motion.div
                                key={selectedMedia.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="flex-1 flex items-center justify-center p-6 min-h-0 bg-muted/5 dark:bg-muted/5"
                            >
                                <div className="w-full h-full flex items-center justify-center max-w-full max-h-full">
                                    {renderFullMedia(selectedMedia)}
                                </div>
                            </motion.div>

                            {/* Navigation */}
                            {isMultipleMedia && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center justify-center p-4 bg-background/80 dark:bg-background/80 backdrop-blur-sm border-t border-border"
                                >
                                    <div className="flex items-center space-x-2 max-w-full overflow-x-auto pb-2">
                                        {media.map((mediaItem, index) => (
                                            <button
                                                key={mediaItem.id}
                                                onClick={() => navigateToMedia(index)}
                                                className={cn(
                                                    "flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden transition-all duration-200",
                                                    "border-2",
                                                    selectedMedia.id === mediaItem.id
                                                        ? "border-primary shadow-lg ring-2 ring-primary/30"
                                                        : "border-border hover:border-primary/50"
                                                )}
                                            >
                                                <img
                                                    src={mediaItem.thumbnailUrl || mediaItem.url}
                                                    alt={mediaItem.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>
        </div>
    );
};

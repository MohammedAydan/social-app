"use client";

import { useState, useCallback, useMemo } from "react";
import { X, Download, FileText, ExternalLink, Play } from "lucide-react";
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
    image: { icon: "📷", label: "Image" },
    video: { icon: "🎥", label: "Video" },
    audio: { icon: "🎵", label: "Audio" },
    file: { icon: "📄", label: "Document" }
} as const;

// Grid layout configurations
const GRID_LAYOUTS = {
    1: { cols: "grid-cols-1", height: "h-[400px] sm:h-[500px]" },
    2: { cols: "grid-cols-2", height: "h-[280px] sm:h-[320px]" },
    3: { cols: "grid-cols-3", height: "h-[200px] sm:h-[240px]" },
    4: { cols: "grid-cols-2", height: "h-[200px] sm:h-[240px]" }
} as const;

export const MediaScrollArea = ({ media, className }: MediaScrollAreaProps) => {
    // State management
    const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Computed values
    const mediaCount = useMemo(() => media.length, [media.length]);
    const isMultipleMedia = useMemo(() => mediaCount > 1, [mediaCount]);
    const gridConfig = useMemo(() => {
        const count = Math.min(mediaCount, 4) as keyof typeof GRID_LAYOUTS;
        return GRID_LAYOUTS[count] || GRID_LAYOUTS[4];
    }, [mediaCount]);

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

    // Thumbnail renderer for grid view
    const renderThumbnail = useCallback((mediaItem: Media) => {
        switch (mediaItem.type) {
            case "image":
                return (
                    <div className="relative group w-full h-full overflow-hidden rounded-xl">
                        <img
                            src={mediaItem.thumbnailUrl || mediaItem.url}
                            alt={mediaItem.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                            draggable={false}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    </div>
                );

            case "video":
                return (
                    <div className="relative group w-full h-full overflow-hidden rounded-xl">
                        <img
                            src={mediaItem.thumbnailUrl || mediaItem.url}
                            alt={mediaItem.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            draggable={false}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors duration-300">
                            <div className="bg-white/90 rounded-full p-3 backdrop-blur-sm shadow-lg">
                                <Play className="h-6 w-6 text-black ml-1" />
                            </div>
                        </div>
                    </div>
                );

            case "audio":
                return (
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-800 dark:to-pink-800 rounded-xl flex flex-col items-center justify-center p-4">
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
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-800 dark:to-cyan-800 rounded-xl flex flex-col items-center justify-center p-4">
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
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-800 dark:to-slate-800 rounded-xl flex flex-col items-center justify-center p-4">
                        <div className="bg-gradient-to-r from-gray-500 to-slate-500 rounded-full p-4 mb-3">
                            <X className="h-8 w-8 text-white" />
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
                        onDownload={() => handleDownload(mediaItem)}
                    />
                );

            case "video":
                return (
                    <CustomVideoPlayer
                        src={mediaItem.url}
                        poster={mediaItem.thumbnailUrl}
                        className="w-full h-full max-h-[70vh]"
                        controls={true}
                    />
                );

            case "audio":
                return (
                    <CustomAudioPlayer
                        src={mediaItem.url}
                        title={mediaItem.name}
                        className="w-full max-w-md mx-auto"
                    />
                );

            case "file":
                return (
                    <div className="w-full max-w-md mx-auto bg-card rounded-xl p-8 text-center border">
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
                );

            default:
                return (
                    <div className="w-full max-w-md mx-auto bg-card rounded-xl p-8 text-center border">
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
                );
        }
    }, [handleDownload]);

    return (
        <div className={cn("w-full", className)}>
            {/* Media Grid */}
            <div
                className={cn(
                    "grid gap-2 sm:gap-3 w-full rounded-2xl overflow-hidden",
                    gridConfig.cols,
                    "bg-muted/20"
                )}
            >
                {media.slice(0, 4).map((mediaItem, index) => {
                    const isLastItem = index === 3 && media.length > 4;
                    const remainingCount = media.length - 4;
                    const config = MEDIA_CONFIG[mediaItem.type] || MEDIA_CONFIG.file;
                    
                    return (
                        <motion.div
                            key={mediaItem.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                                "relative cursor-pointer group overflow-hidden rounded-xl shadow-sm",
                                gridConfig.height,
                                media.length === 3 && index === 2 && "col-span-3"
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
                            
                            {/* Media type indicator */}
                            <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <div className="bg-black/80 text-white px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-sm flex items-center gap-1">
                                    <span>{config.icon}</span>
                                    <span>{config.label}</span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Media count indicator */}
            {isMultipleMedia && (
                <div className="flex items-center justify-center mt-4">
                    <div className="flex items-center space-x-2 bg-muted/50 rounded-full px-4 py-2">
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
                            className={cn(
                                "p-0 bg-black/95 backdrop-blur-md border-0",
                                "max-w-[95vw] max-h-[95vh] w-auto h-auto",
                                "sm:max-w-[90vw] sm:max-h-[90vh]",
                                "flex flex-col overflow-hidden rounded-2xl"
                            )}
                        >
                            {/* Header */}
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm border-b border-white/10"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="text-white text-sm font-medium max-w-xs truncate">
                                        {selectedMedia.name}
                                    </div>
                                    <div className="text-white/60 text-xs uppercase tracking-wide">
                                        {MEDIA_CONFIG[selectedMedia.type]?.label || 'Unknown'}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-white/70 hover:text-white hover:bg-white/10"
                                        onClick={() => handleDownload(selectedMedia)}
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                    <DialogClose asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-white/70 hover:text-white hover:bg-white/10"
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
                                className="flex-1 flex items-center justify-center p-6 min-h-0"
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
                                    className="flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm border-t border-white/10"
                                >
                                    <div className="flex items-center space-x-2 max-w-full overflow-x-auto">
                                        {media.map((mediaItem, index) => (
                                            <button
                                                key={mediaItem.id}
                                                onClick={() => navigateToMedia(index)}
                                                className={cn(
                                                    "flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden transition-all duration-200",
                                                    "border-2 hover:scale-110",
                                                    selectedMedia.id === mediaItem.id
                                                        ? "border-white scale-110 shadow-lg"
                                                        : "border-white/30 hover:border-white/60"
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

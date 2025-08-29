"use client";

import { useState, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCw, Download, Maximize } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

interface CustomImageViewerProps {
    src: string;
    alt: string;
    className?: string;
    showControls?: boolean;
    onDownload?: () => void;
}

export const CustomImageViewer = ({
    src,
    alt,
    className,
    showControls = true,
    onDownload
}: CustomImageViewerProps) => {
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [showControlsOverlay, setShowControlsOverlay] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const zoomIn = useCallback(() => {
        setScale(prev => Math.min(prev + 0.25, 3));
    }, []);

    const zoomOut = useCallback(() => {
        setScale(prev => Math.max(prev - 0.25, 0.25));
    }, []);

    const rotate = useCallback(() => {
        setRotation(prev => (prev + 90) % 360);
    }, []);

    const resetView = useCallback(() => {
        setScale(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (scale > 1) {
            setIsDragging(true);
            e.preventDefault();
        }
    }, [scale]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (isDragging && scale > 1) {
            setPosition(prev => ({
                x: prev.x + e.movementX,
                y: prev.y + e.movementY
            }));
        }
    }, [isDragging, scale]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            zoomIn();
        } else {
            zoomOut();
        }
    }, [zoomIn, zoomOut]);

    return (
        <div
            className={cn(
                "relative bg-muted/30 rounded-xl overflow-hidden group",
                "flex items-center justify-center",
                className
            )}
            onMouseEnter={() => setShowControlsOverlay(true)}
            onMouseLeave={() => setShowControlsOverlay(false)}
        >
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            )}

            {/* Image */}
            <div
                className="relative cursor-move select-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                style={{
                    transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
                    transition: isDragging ? 'none' : 'transform 0.2s ease-in-out'
                }}
            >
                <img
                    src={src}
                    alt={alt}
                    className="max-w-full max-h-full object-contain rounded-lg"
                    onLoad={() => setIsLoading(false)}
                    onError={() => setIsLoading(false)}
                    draggable={false}
                />
            </div>

            {/* Controls Overlay */}
            {showControls && (
                <div
                    className={cn(
                        "absolute top-4 right-4 flex flex-col space-y-2",
                        "transition-opacity duration-200",
                        showControlsOverlay ? "opacity-100" : "opacity-0"
                    )}
                >
                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={zoomIn}
                        className="bg-black/70 text-white hover:bg-black/80 backdrop-blur-sm h-8 w-8"
                        disabled={scale >= 3}
                    >
                        <ZoomIn className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={zoomOut}
                        className="bg-black/70 text-white hover:bg-black/80 backdrop-blur-sm h-8 w-8"
                        disabled={scale <= 0.25}
                    >
                        <ZoomOut className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={rotate}
                        className="bg-black/70 text-white hover:bg-black/80 backdrop-blur-sm h-8 w-8"
                    >
                        <RotateCw className="h-4 w-4" />
                    </Button>

                    {onDownload && (
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={onDownload}
                            className="bg-black/70 text-white hover:bg-black/80 backdrop-blur-sm h-8 w-8"
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                    )}

                    <Button
                        variant="secondary"
                        size="icon"
                        onClick={resetView}
                        className="bg-black/70 text-white hover:bg-black/80 backdrop-blur-sm h-8 w-8"
                    >
                        <Maximize className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Zoom Indicator */}
            {scale !== 1 && (
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-md text-sm backdrop-blur-sm">
                    {Math.round(scale * 100)}%
                </div>
            )}

            {/* Instructions */}
            {showControlsOverlay && scale > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-md text-xs backdrop-blur-sm">
                    Drag to pan • Scroll to zoom
                </div>
            )}
        </div>
    );
};

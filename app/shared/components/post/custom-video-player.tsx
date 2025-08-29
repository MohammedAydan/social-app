"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Slider } from "~/components/ui/slider";

interface CustomVideoPlayerProps {
    src: string;
    poster?: string;
    className?: string;
    autoPlay?: boolean;
    muted?: boolean;
    loop?: boolean;
    controls?: boolean;
}

export const CustomVideoPlayer = ({
    src,
    poster,
    className,
    autoPlay = false,
    muted = false,
    loop = false,
    controls = true
}: CustomVideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(muted);
    const [volume, setVolume] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [showPoster, setShowPoster] = useState(true);

    const togglePlay = useCallback(() => {
        if (!videoRef.current) return;
        
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
            setShowPoster(false); // Hide poster when playing
        }
        setIsPlaying(!isPlaying);
    }, [isPlaying]);

    const toggleMute = useCallback(() => {
        if (!videoRef.current) return;
        
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    }, [isMuted]);

    const handleVolumeChange = useCallback((value: number[]) => {
        if (!videoRef.current) return;
        
        const newVolume = value[0];
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    }, []);

    const handleTimeUpdate = useCallback(() => {
        if (!videoRef.current) return;
        setCurrentTime(videoRef.current.currentTime);
    }, []);

    const handleLoadedMetadata = useCallback(() => {
        if (!videoRef.current) return;
        setDuration(videoRef.current.duration);
        setIsLoading(false);
    }, []);

    const handleSeek = useCallback((value: number[]) => {
        if (!videoRef.current) return;
        
        const newTime = value[0];
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    }, []);

    const toggleFullscreen = useCallback(() => {
        if (!containerRef.current) return;

        if (!isFullscreen) {
            if (containerRef.current.requestFullscreen) {
                containerRef.current.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }, [isFullscreen]);

    const formatTime = useCallback((time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, []);

    const restart = useCallback(() => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = 0;
        setCurrentTime(0);
    }, []);

    // Handle fullscreen change
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Auto-hide controls
    useEffect(() => {
        let timeout: NodeJS.Timeout;

        const handleMouseMove = () => {
            setShowControls(true);
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (isPlaying) setShowControls(false);
            }, 3000);
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('mousemove', handleMouseMove);
            container.addEventListener('mouseleave', () => {
                if (isPlaying) setShowControls(false);
            });
        }

        return () => {
            clearTimeout(timeout);
            if (container) {
                container.removeEventListener('mousemove', handleMouseMove);
            }
        };
    }, [isPlaying]);

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative bg-background dark:bg-background rounded-xl overflow-hidden group",
                "focus-within:ring-2 focus-within:ring-primary/50 border border-border",
                className
            )}
        >
            {/* Poster Image */}
            {showPoster && poster && (
                <div className="absolute inset-0 z-10">
                    <img
                        src={poster}
                        alt="Video poster"
                        className="w-full h-full object-cover rounded-xl"
                        draggable={false}
                    />
                    <div className="absolute inset-0 bg-black/20" />
                </div>
            )}

            <video
                ref={videoRef}
                src={src}
                poster={showPoster ? undefined : poster}
                autoPlay={autoPlay}
                muted={muted}
                loop={loop}
                className="w-full h-full object-cover"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => {
                    setIsPlaying(true);
                    setShowPoster(false);
                }}
                onPause={() => setIsPlaying(false)}
                onWaiting={() => setIsLoading(true)}
                onCanPlay={() => setIsLoading(false)}
                onClick={togglePlay}
            />

            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            )}

            {/* Play Button Overlay */}
            {(!isPlaying || showPoster) && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-15">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="bg-background/20 hover:bg-background/30 backdrop-blur-sm rounded-full h-16 w-16 border border-border/30"
                        onClick={togglePlay}
                    >
                        <Play className="h-8 w-8 text-foreground ml-1" />
                    </Button>
                </div>
            )}

            {/* Controls */}
            {controls && (
                <div
                    className={cn(
                        "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-4 border-t border-border/30",
                        "transition-opacity duration-300",
                        showControls ? "opacity-100" : "opacity-0"
                    )}
                >
                    {/* Progress Bar */}
                    <div className="mb-4">
                        <Slider
                            value={[currentTime]}
                            max={duration}
                            step={0.1}
                            onValueChange={handleSeek}
                            className="w-full cursor-pointer"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        {/* Left Controls */}
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={togglePlay}
                                className="text-foreground hover:bg-muted/50 h-8 w-8"
                            >
                                {isPlaying ? (
                                    <Pause className="h-4 w-4" />
                                ) : (
                                    <Play className="h-4 w-4 ml-0.5" />
                                )}
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={restart}
                                className="text-foreground hover:bg-muted/50 h-8 w-8"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>

                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleMute}
                                    className="text-foreground hover:bg-muted/50 h-8 w-8"
                                >
                                    {isMuted || volume === 0 ? (
                                        <VolumeX className="h-4 w-4" />
                                    ) : (
                                        <Volume2 className="h-4 w-4" />
                                    )}
                                </Button>

                                <div className="w-20">
                                    <Slider
                                        value={[isMuted ? 0 : volume]}
                                        max={1}
                                        step={0.1}
                                        onValueChange={handleVolumeChange}
                                        className="cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Controls */}
                        <div className="flex items-center space-x-4">
                            <span className="text-foreground text-sm">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleFullscreen}
                                className="text-foreground hover:bg-muted/50 h-8 w-8"
                            >
                                <Maximize className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

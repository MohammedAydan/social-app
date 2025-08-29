"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, RotateCcw, Music, AlertCircle } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Slider } from "~/components/ui/slider";

interface CustomAudioPlayerProps {
    src: string;
    title: string;
    className?: string;
    autoPlay?: boolean;
    loop?: boolean;
    onError?: (error: string) => void;
}

export const CustomAudioPlayer = ({
    src,
    title,
    className,
    autoPlay = false,
    loop = false,
    onError
}: CustomAudioPlayerProps) => {
    const audioRef = useRef<HTMLAudioElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const togglePlay = useCallback(async () => {
        if (!audioRef.current || hasError) return;

        try {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                await audioRef.current.play();
            }
        } catch (error) {
            console.error("Audio play error:", error);
            setHasError(true);
            setErrorMessage("Unable to play audio");
            onError?.("Unable to play audio");
        }
    }, [isPlaying, hasError, onError]);

    const toggleMute = useCallback(() => {
        if (!audioRef.current) return;

        audioRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    }, [isMuted]);

    const handleVolumeChange = useCallback((value: number[]) => {
        if (!audioRef.current) return;

        const newVolume = value[0];
        audioRef.current.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    }, []);

    const handleTimeUpdate = useCallback(() => {
        if (!audioRef.current) return;
        setCurrentTime(audioRef.current.currentTime);
    }, []);

    const handleLoadedMetadata = useCallback(() => {
        if (!audioRef.current) return;
        setDuration(audioRef.current.duration);
        setIsLoading(false);
        setHasError(false);
        setErrorMessage("");
    }, []);

    const handleError = useCallback((error: Event) => {
        console.error("Audio loading error:", error);
        setIsLoading(false);
        setHasError(true);
        setErrorMessage("Failed to load audio");
        onError?.("Failed to load audio");
    }, [onError]);

    const handleSeek = useCallback((value: number[]) => {
        if (!audioRef.current) return;

        const newTime = value[0];
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    }, []);

    const restart = useCallback(() => {
        if (!audioRef.current || hasError) return;
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
    }, [hasError]);

    const formatTime = useCallback((time: number) => {
        if (!isFinite(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, []);

    // Setup audio event listeners
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleWaiting = () => setIsLoading(true);
        const handleCanPlay = () => setIsLoading(false);
        const handleEnded = () => {
            setIsPlaying(false);
            if (!loop) {
                setCurrentTime(0);
            }
        };

        audio.addEventListener('play', handlePlay);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('waiting', handleWaiting);
        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);

        return () => {
            audio.removeEventListener('play', handlePlay);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('waiting', handleWaiting);
            audio.removeEventListener('canplay', handleCanPlay);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        };
    }, [handleError, handleTimeUpdate, handleLoadedMetadata, loop]);

    return (
        <div className={cn(
            "relative bg-gradient-to-br from-primary/5 to-secondary/5",
            "dark:from-primary/10 dark:to-secondary/10",
            "rounded-xl p-6 shadow-lg border border-border",
            "backdrop-blur-sm transition-all duration-200",
            className
        )}>
            <audio
                ref={audioRef}
                src={src}
                autoPlay={autoPlay}
                loop={loop}
                preload="metadata"
            />

            {hasError ? (
                // Error State
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-20 h-20 rounded-full bg-destructive/10 dark:bg-destructive/20 flex items-center justify-center mb-4">
                        <AlertCircle className="h-10 w-10 text-destructive" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Audio Error</h3>
                    <p className="text-sm text-muted-foreground text-center">
                        {errorMessage}
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setHasError(false);
                            setErrorMessage("");
                            setIsLoading(true);
                            if (audioRef.current) {
                                audioRef.current.load();
                            }
                        }}
                        className="mt-4"
                    >
                        Try Again
                    </Button>
                </div>
            ) : (
                <>
                    {/* Audio Visualizer */}
                    <div className="flex items-center justify-center mb-6">
                        <div className="relative">
                            <div className={cn(
                                "w-20 h-20 rounded-full bg-gradient-to-r from-primary to-secondary",
                                "flex items-center justify-center shadow-lg border border-border/20",
                                "transition-all duration-300",
                                isPlaying && "animate-pulse scale-105"
                            )}>
                                <Music className="h-10 w-10 text-primary-foreground" />
                            </div>

                            {/* Play/Pause Overlay */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={togglePlay}
                                disabled={isLoading}
                                className={cn(
                                    "absolute inset-0 rounded-full bg-background/20 hover:bg-background/30",
                                    "backdrop-blur-sm transition-all duration-200",
                                    "opacity-0 hover:opacity-100 focus:opacity-100",
                                    "disabled:opacity-50 disabled:cursor-not-allowed"
                                )}
                                aria-label={isPlaying ? "Pause audio" : "Play audio"}
                            >
                                {isLoading ? (
                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-foreground border-t-transparent"></div>
                                ) : isPlaying ? (
                                    <Pause className="h-6 w-6 text-foreground" />
                                ) : (
                                    <Play className="h-6 w-6 ml-1 text-foreground" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Track Info */}
                    <div className="text-center mb-4">
                        <h3 className="font-semibold text-foreground truncate" title={title}>
                            {title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Audio File
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                        <Slider
                            value={[currentTime]}
                            max={duration || 1}
                            step={0.1}
                            onValueChange={handleSeek}
                            disabled={isLoading || hasError}
                            className="w-full cursor-pointer"
                            aria-label="Audio progress"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between">
                        {/* Left Controls */}
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={togglePlay}
                                disabled={isLoading || hasError}
                                className="h-10 w-10 rounded-full bg-muted/50 hover:bg-muted"
                                aria-label={isPlaying ? "Pause" : "Play"}
                            >
                                {isPlaying ? (
                                    <Pause className="h-5 w-5" />
                                ) : (
                                    <Play className="h-5 w-5 ml-0.5" />
                                )}
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={restart}
                                disabled={isLoading || hasError}
                                className="h-8 w-8 rounded-full bg-muted/30 hover:bg-muted/50"
                                aria-label="Restart"
                            >
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Volume Controls */}
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleMute}
                                disabled={isLoading || hasError}
                                className="h-8 w-8 rounded-full bg-muted/30 hover:bg-muted/50"
                                aria-label={isMuted ? "Unmute" : "Mute"}
                            >
                                {isMuted || volume === 0 ? (
                                    <VolumeX className="h-4 w-4" />
                                ) : (
                                    <Volume2 className="h-4 w-4" />
                                )}
                            </Button>

                            <div className="w-16">
                                <Slider
                                    value={[isMuted ? 0 : volume]}
                                    max={1}
                                    step={0.1}
                                    onValueChange={handleVolumeChange}
                                    disabled={isLoading || hasError}
                                    className="cursor-pointer"
                                    aria-label="Volume"
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

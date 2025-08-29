import React, { createContext, useContext, useState } from "react";
import { uploadAsset } from "~/shared/api/api.storage";
import type { CreateMediaRequest } from "~/shared/types/create-post-type";

interface MediaContextType {
    media: CreateMediaRequest[];
    setMedia: React.Dispatch<React.SetStateAction<CreateMediaRequest[]>>;
    selectedMedia: File | null;
    error: string | null;
    isLoading: boolean;
    handleUploadAndAddMedia: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    removeMedia: (index: number) => void;
    getMediaType: (file: File) => 'image' | 'video' | 'audio' | 'other';
    getMediaTypeByUrl: (url: string) => 'image' | 'video' | 'audio' | 'other';
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const MediaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [media, setMedia] = useState<CreateMediaRequest[]>([]);
    const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleUploadAndAddMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsLoading(true);
            setSelectedMedia(file);
            try {
                const mediaUrl = await uploadAsset({
                    file: file,
                    type: getMediaType(file)
                });

                if (!mediaUrl.success || mediaUrl.data == null || !mediaUrl.data) {
                    setError("Upload failed");
                    return;
                }

                const newMedia: CreateMediaRequest = {
                    postId: '',
                    name: file.name,
                    type: getMediaType(file),
                    url: mediaUrl.data,
                    thumbnailUrl: '',
                };

                setMedia((prev) => [...prev, newMedia]);
                setError(null);
            } catch (error) {
                setError("Failed to upload media");
            } finally {
                setIsLoading(false);
                setSelectedMedia(null);
            }
        } else {
            setError(null);
        }
        setIsLoading(false);
    };

    const removeMedia = (index: number) => {
        setMedia(media.filter((_, i) => i !== index));
    };

    const getMediaType = (file: File): 'image' | 'video' | 'audio' | 'other' => {
        if (file.type.startsWith('image/')) return 'image';
        if (file.type.startsWith('video/')) return 'video';
        if (file.type.startsWith('audio/')) return 'audio';
        return 'other';
    };

    const getMediaTypeByUrl = (url: string): 'image' | 'video' | 'audio' | 'other' => {
        const extension = url.split('.').pop()?.toLowerCase();
        if (!extension) return 'other';
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff', 'tif', 'ico', 'heic', 'heif', 'raw', 'cr2', 'nef', 'arw', 'dng', 'orf', 'rw2', 'pef', 'srw', 'x3f', 'raf', 'mrw', 'mdc', 'kdc', 'dcr', 'erf', '3fr', 'fff', 'mef', 'mos', 'iiq', 'tak', 'bay', 'sr2', 'rwl', 'ptx', 'cap', 'rwz', 'nrw', 'srf', 'srw', 'ptx', 'cap', 'rwz', 'nrw', 'srf', 'ptx', 'cap', 'rwz', 'nrw', 'srf'];
        const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'mpeg', 'mpg', '3gp', 'm4v', 'asf', 'vob', 'ogv', 'rm', 'rmvb', 'ts', 'mts', 'm2ts', 'f4v', 'f4p', 'f4a', 'f4b', 'divx', 'xvid', 'mxf', 'r3d', 'braw', 'dng', 'mlv', 'mvi', 'ravi', 'cine', 'dpx', 'exr', 'hdr', 'log', 'ari', 'avc', 'h264', 'h265', 'hevc', 'vp8', 'vp9', 'av1', 'prores', 'dnxhd', 'cineform', 'red', 'r3d', 'braw', 'dng', 'mlv', 'mvi', 'ravi', 'cine', 'dpx', 'exr', 'hdr', 'log', 'ari', 'avc'];
        const audioExtensions = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma', 'opus', 'aiff', 'au', 'ra', 'ape', 'dsd', 'dsf', 'dff', 'wv', 'tta', 'tak', 'mpc', 'ofr', 'ofs', 'spx', 'vorbis', 'ac3', 'dts', 'eac3', 'mlp', 'truehd', 'atmos', 'dolby', 'pcm', 'alac', 'caf', 'amr', 'gsm', 'awb', '3ga', 'mka', 'webm', 'oga', 'spx', 'opus', 'm4b', 'm4p', 'aa', 'aax', 'act', 'dvf', 'vox', 'raw', 'ub', 'sb', 'sw', 'uw', 'sln', 'nul', 'l16', 'mulaw', 'alaw', 'g722', 'g723', 'g726', 'g728', 'g729', 'silk', 'speex', 'celp', 'evrc', 'qcelp', 'smv', 'vmr'];
        if (imageExtensions.includes(extension)) return 'image';
        if (videoExtensions.includes(extension)) return 'video';
        if (audioExtensions.includes(extension)) return 'audio';
        return 'other';
    };

    const value: MediaContextType = {
        media,
        setMedia,
        selectedMedia,
        error,
        isLoading,
        handleUploadAndAddMedia,
        removeMedia,
        getMediaType,
        getMediaTypeByUrl,
    };

    return (
        <MediaContext.Provider value={value}>
            {children}
        </MediaContext.Provider>
    );
};

export const useManageMedia = (): MediaContextType => {
    const context = useContext(MediaContext);
    if (!context) {
        throw new Error("useManageMedia must be used within a MediaProvider");
    }
    return context;
};
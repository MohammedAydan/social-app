import { User } from "lucide-react";
import { useEffect, useState } from "react";
import { getInitials } from "../utils/display-name";

type UserAvatarProps = {
    url?: string;
    file?: File | null;
    username?: string;
    /** Full "First Last" name: used for alt text and initial fallback. */
    displayName?: string;
    size?: number;
};

const UserAvatar = ({
    url,
    file,
    username = "User",
    displayName,
    size = 48,
}: UserAvatarProps) => {
    const dimension = `${size}px`;
    const [fileUrl, setFileUrl] = useState<string | undefined>();

    useEffect(() => {
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setFileUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setFileUrl(undefined);
        }
    }, [file]);

    const imageSrc = fileUrl || url;
    const altName = displayName?.trim() || username;
    const initials = getInitials(displayName?.trim() ? displayName : username === "User" ? "" : username);

    return imageSrc ? (
        <img
            src={imageSrc}
            alt={`${altName}'s avatar`}
            width={dimension}
            height={dimension}
            loading="lazy"
            className="rounded-full object-cover border border-border bg-muted shrink-0"
            style={{ width: dimension, height: dimension }}
        />
    ) : initials ? (
        <div
            role="img"
            aria-label={`${altName}'s avatar`}
            className="rounded-full flex items-center justify-center border border-border bg-primary/15 text-primary font-semibold shrink-0 select-none"
            style={{ width: dimension, height: dimension, fontSize: size * 0.36 }}
        >
            {initials}
        </div>
    ) : (
        <div
            className="bg-primary/10 rounded-full flex items-center justify-center border border-border shrink-0"
            style={{ width: dimension, height: dimension }}
        >
            <User
                className="text-primary"
                style={{ width: size * 0.5, height: size * 0.5 }}
            />
        </div>
    );
};

export default UserAvatar;

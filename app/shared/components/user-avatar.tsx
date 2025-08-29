import { User } from "lucide-react";
import { useEffect, useState } from "react";

type UserAvatarProps = {
    url?: string;
    file?: File | null;
    username?: string;
    size?: number;
};

const UserAvatar = ({
    url,
    file,
    username = "User",
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

    return imageSrc ? (
        <img
            src={imageSrc}
            alt={`${username}'s avatar`}
            width={dimension}
            height={dimension}
            className="rounded-full object-cover border"
            style={{ width: dimension, height: dimension }}
        />
    ) : (
        <div
            className="bg-primary/10 rounded-full flex items-center justify-center border"
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

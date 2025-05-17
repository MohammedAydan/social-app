import { User } from "lucide-react";

const UserAvatar = ({
    url,
    username = "User",
    size = 48,
}: {
    url?: string;
    username?: string;
    size?: number;
}) => {
    const dimension = `${size}px`;

    return url ? (
        <img
            src={url}
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

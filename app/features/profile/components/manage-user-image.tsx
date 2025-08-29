import type { UserType } from "~/shared/types/user-type";
import useUpdateProfileImage from "../hooks/use-update-profile-image";
import UserAvatar from "~/shared/components/user-avatar";
import { Edit2Icon, X } from "lucide-react";
import FixedLoading from "./fixed-loading";

const ManageUserImage = ({
    url,
    username = "User",
    user,
    size = 48,
}: {
    url?: string;
    username?: string;
    user: UserType;
    size?: number;
}) => {
    const {
        selectedImage,
        handleImageChange,
        handleRemoveSelectedImage,
        handleUploadAndUpdateProfileImage,
        isLoading,
        error,
    } = useUpdateProfileImage({ user });

    return (
        <div className="relative group flex items-center justify-center">
            <div className="relative">
                <UserAvatar
                    file={selectedImage ?? null}
                    url={url}
                    username={username}
                    size={size}
                />
                <label className="absolute bottom-2 right-2 bg-primary text-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-primary/80 transition-colors flex items-center justify-center">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                        disabled={isLoading}
                    />
                    <Edit2Icon width={18} height={18} />
                </label>
                {selectedImage && (
                    <button
                        onClick={handleRemoveSelectedImage}
                        className="absolute top-2 right-2 bg-red-700 text-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-primary/80 transition-colors flex items-center justify-center">
                        <X width={18} height={18} />
                    </button>
                )}
                {selectedImage && (
                    <button
                        className="cursor-pointer absolute top-2 left-2 bg-gradient-to-r from-primary to-secondary text-white rounded-full px-4 py-1 text-xs font-semibold shadow-lg hover:scale-105 transition-transform"
                        onClick={handleUploadAndUpdateProfileImage}
                        disabled={isLoading}
                    >
                        {isLoading ? "Uploading..." : "Save"}
                    </button>
                )}
            </div>
            {error && (
                <div className="ml-4 text-xs text-red-500 bg-background/80 rounded px-3 py-2 shadow">
                    {error}
                </div>
            )}

            {isLoading && (
                <FixedLoading />
            )}
        </div>
    );
};

export default ManageUserImage;
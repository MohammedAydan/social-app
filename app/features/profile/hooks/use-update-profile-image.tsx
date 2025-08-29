import { useState } from "react";
import { useAuth } from "~/features/auth/hooks/use-auth";
import { updateUserProfile } from "~/shared/api";
import { uploadAsset } from "~/shared/api/api.storage";
import type { UserType } from "~/shared/types/user-type";

type ValidationResult = {
    isValid: boolean;
    error: string | null;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif"];

const validateImage = (file: File): ValidationResult => {
    if (!ALLOWED_TYPES.includes(file.type)) {
        return { isValid: false, error: "Only JPG, PNG, and GIF files are allowed." };
    }
    if (file.size > MAX_FILE_SIZE) {
        return { isValid: false, error: "File size must be less than 2MB." };
    }
    return { isValid: true, error: null };
};

const useUpdateProfileImage = ({ user }: { user: UserType }) => {
    const { setUser } = useAuth();
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsLoading(true);
        setError(null);
        const file = e.target.files?.[0];
        if (file) {
            const validation = validateImage(file);
            if (validation.isValid) {
                setSelectedImage(file);
                setError(null);
            } else {
                setSelectedImage(null);
                setError(validation.error);
            }
        } else {
            setSelectedImage(null);
            setError(null);
        }
        setIsLoading(false);
    };

    const handleRemoveSelectedImage = () => {
        setSelectedImage(null);
    }

    const handleUploadAndUpdateProfileImage = async (): Promise<string | null> => {
        try {
            setIsLoading(true);
            setError(null);
            if (!selectedImage) {
                setError("No image selected.");
                setIsLoading(false);
                return null;
            }
            const result = await uploadAsset({ file: selectedImage, type: "image" });
            if (result.success != true && !result.data) {
                setError("Upload failed. Please try again.");
                return null;
            }

            const resultUpdate = await updateUserProfile({
                id: user.id,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                userName: user.userName || '',
                birthDate: user.birthDate ? new Date(user.birthDate) : new Date(),
                userGender: user.userGender || '',
                bio: user.bio || '',
                profileImageUrl: result.data || user.profileImageUrl,
                isPrivate: user.isPrivate ?? false,
            });

            if (resultUpdate.success != true && !resultUpdate.data) {
                setError("Update profile failed. Please try again.");
                return null;
            }

            if (resultUpdate.data) {
                setUser(resultUpdate.data);
            }
            setSelectedImage(null);
            setError(null);
            return result.data ?? null;
        } catch (error) {
            setError("An unexpected error occurred. Please try again.");
            return null;
        } finally {
            setIsLoading(false);
        }
    }

    return {
        selectedImage,
        handleImageChange,
        handleRemoveSelectedImage,
        setSelectedImage,
        handleUploadAndUpdateProfileImage,
        isLoading,
        error,
    };
};

export default useUpdateProfileImage;
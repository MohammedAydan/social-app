import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';
import { Switch } from '~/components/ui/switch';
import { Button } from '~/components/ui/button';
import { DropdownMenuItem } from '~/components/ui/dropdown-menu';
import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useAuth } from '~/features/auth/hooks/use-auth';
import type { UpdateUserType } from '~/shared/types/user-type';
import { updateUserProfile } from '~/shared/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';

interface UpdateUserDialogProps {
    triggerAs?: 'button' | 'dropdown';
}

const UpdateUserDialog = ({ triggerAs = 'button' }: UpdateUserDialogProps) => {
    const { user, setUser } = useAuth();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!user) return null;

    const [form, setForm] = useState<UpdateUserType>({
        id: user.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        userName: user.userName || '',
        birthDate: user.birthDate ? new Date(user.birthDate) : new Date(),
        userGender: user.userGender || '',
        bio: user.bio || '',
        profileImageUrl: user.profileImageUrl || '',
        isPrivate: user.isPrivate ?? false,
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSwitch = (value: boolean) => {
        setForm(prev => ({ ...prev, isPrivate: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await updateUserProfile(form);
            setUser({ ...user, ...form });
            setOpen(false);
        } catch (error) {
            // console.error('Update failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerAs === 'dropdown' ? (
                    <DropdownMenuItem className="cursor-pointer">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Profile
                    </DropdownMenuItem>
                ) : (
                    <Button variant="outline" className="w-[85%]">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Profile
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>Update your account details below.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <Input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" />
                    <Input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" />
                    {/* <Input name="userName" value={form.userName} onChange={handleChange} placeholder="Username" /> */}
                    <Input
                        name="birthDate"
                        type="date"
                        value={form.birthDate.toISOString().split('T')[0]}
                        onChange={e =>
                            setForm(prev => ({
                                ...prev,
                                birthDate: new Date(e.target.value),
                            }))
                        }
                    />

                    <Select
                        value={form.userGender}
                        onValueChange={value => setForm(prev => ({ ...prev, userGender: value }))}
                    >
                        <SelectTrigger
                            className="w-full py-6 border-input bg-background text-foreground focus:ring-2 focus:ring-primary"
                        >
                            <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                    </Select>

                    <Textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Bio" />
                    <Input name="profileImageUrl" value={form.profileImageUrl} onChange={handleChange} placeholder="Profile Image URL" />

                    <div className="flex items-center justify-between">
                        <span>Private Account</span>
                        <Switch checked={form.isPrivate} onCheckedChange={handleSwitch} />
                    </div>
                </div>

                <DialogFooter className="mt-4">
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateUserDialog;

import { useChangePassword } from "../hooks/use-change-password";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

const ChangePasswordDialog = () => {
    const {
        setCurrentPassword,
        setNewPassword,
        setConfirmPassword,
        open,
        setOpen,
        loading,
        errors,
        handleChangePassword
    } = useChangePassword();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" className="w-full justify-start">Change Password</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>Manage your account settings and preferences here.</DialogDescription>
                </DialogHeader>
                <Separator />
                {errors && errors.length > 0 && (
                    <div className="text-red-500 text-sm mb-2 flex flex-col gap-1">
                        {errors.map((err, idx) => (
                            <div key={idx} className="border-1 border-red-600 rounded-2xl p-2">{err}</div>
                        ))}
                    </div>
                )}
                <div className="space-y-4">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" onChange={(v) => setCurrentPassword(v.target.value)} placeholder="Enter current password" />

                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" onChange={(v) => setNewPassword(v.target.value)} placeholder="Enter new password" />

                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input id="confirm-password" type="password" onChange={(v) => setConfirmPassword(v.target.value)} placeholder="Enter confirm password" />
                    <Separator />
                    <Button className="w-full" onClick={handleChangePassword} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default ChangePasswordDialog;
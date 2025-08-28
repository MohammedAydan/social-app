import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import ChangePasswordDialog from "./change-password-dialog";
import { Settings } from "lucide-react";

const SettingsDialog = () => {

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={"outline"} size={"icon"}>
                    <Settings />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>Manage your account settings and preferences here.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <ChangePasswordDialog />
                </div>

            </DialogContent>
        </Dialog>
    );
}

export default SettingsDialog;
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "@/core/auth/AuthContext";
import { useUpdateProfile } from "@/features/inventory/services/profileService";
import ImageUpload from "@/shared/components/ImageUpload";
import {
  UpdateProfilePayload,
  updateProfileSchema,
} from "@/shared/types/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function EditProfileDialog() {
  const { user } = useAuthContext();
  const [open, setOpen] = useState(false);

  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

  const form = useForm<UpdateProfilePayload>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      profile_image_url: user?.profile_image_url ?? "",
    },
  });

  const onSubmit = async (data: UpdateProfilePayload) => {
    try {
      await updateProfile(data);
      toast.success("Profile updated successfully");
      setOpen(false);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update profile",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit2 className="h-4 w-4" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="image"
              render={({ field: { onChange, value, ...rest } }) => (
                <FormItem>
                  <FormControl>
                    <ImageUpload
                      label="Profile Picture"
                      imageFile={value}
                      imageUrl={form.watch("profile_image_url") ?? ""}
                      previewUrl={
                        value
                          ? URL.createObjectURL(value)
                          : form.watch("profile_image_url") ?? ""
                      }
                      onFileChange={(file) => {
                        onChange(file);
                        if (file) {
                          form.setValue("profile_image_url", "");
                        }
                      }}
                      onUrlChange={(url) => {
                        form.setValue("profile_image_url", url);
                        if (url) {
                          onChange(undefined);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your phone number"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

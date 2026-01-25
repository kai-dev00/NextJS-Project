"use client";

import { useForm } from "react-hook-form";
import { changePasswordAction } from "@/app/actions/auth.change-password";
import { useState } from "react";
import { CustomInput } from "@/components/CustomInput";
import { showToast } from "@/lib/toast";

type Props = {
  user: {
    id: string;
    fullName: string | null;
    email: string;
    role: string;
    phoneNumber: string;
    createdAt: string;
  };
  session: {
    role: string;
  };
};

type ChangePasswordForm = {
  currentPassword: string;
  newPassword: string;
};

export default function ProfileClient({ user, session }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordForm>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(data: ChangePasswordForm) {
    setError(null);
    setSuccess(false);

    try {
      await changePasswordAction(data.currentPassword, data.newPassword);
      setSuccess(true);
      showToast.success(
        "Password updated",
        "Your password has been updated successfully.",
      );
      reset();
    } catch (err: any) {
      showToast.error(
        "Something went wrong",
        err?.message ?? "Failed to update password.",
      );
      setError(err?.message ?? "Something went wrong");
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      {/* Profile info */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-lg font-semibold text-white">
            {user.fullName?.[0] ?? "U"}
          </div>

          <div>
            <p className="text-lg font-medium">
              {user.fullName ?? "Unnamed User"}
            </p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoRow label="Role" value={user.role} />
          <InfoRow
            label="Joined"
            value={new Date(user.createdAt).toLocaleDateString()}
          />
          <InfoRow label="Role" value={session.role} />
          <InfoRow label="Phone Number" value={user.phoneNumber} />
        </div>
      </div>

      {/* Change password */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-medium">Change Password</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <CustomInput
            label="Current Password"
            type="password"
            autoComplete="current-password"
            required
            error={errors.currentPassword?.message}
            {...register("currentPassword", {
              required: "Current password is required",
            })}
          />

          <CustomInput
            label="New Password"
            type="password"
            autoComplete="new-password"
            required
            error={errors.newPassword?.message}
            {...register("newPassword", {
              required: "New password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {isSubmitting ? "Updating..." : "Update"}
          </button>
        </form>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

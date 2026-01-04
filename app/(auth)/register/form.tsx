"use client";

import { useForm } from "react-hook-form";
import { useTransition, useState, JSX } from "react";
import { registerAction, RegisterState } from "@/app/actions/auth.register";
import { useRouter } from "next/navigation";

type Role = {
  id: number;
  name: string;
};

type RegisterFormValues = {
  email: string;
  password: string;
  fullName?: string;
  roleId: number;
};

type Props = {
  roles: Role[];
};

export default function RegisterForm({ roles }: Props): JSX.Element {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      roleId: roles[0]?.id,
    },
  });
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverState, setServerState] = useState<RegisterState>({});

  const onSubmit = (data: RegisterFormValues) => {
    startTransition(async () => {
      const result = await registerAction(data);
      setServerState(result);
    });
    reset();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-5 rounded-xl border bg-white p-6 shadow-sm"
      >
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-gray-500">
            Fill in the details below to get started
          </p>
        </div>

        {/* Server messages */}
        {serverState.error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            {serverState.error}
          </div>
        )}

        {serverState.success && (
          <div className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-600">
            Account created successfully
          </div>
        )}

        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Full Name</label>
          <input
            {...register("fullName")}
            placeholder="Juan Dela Cruz"
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            {...register("email", { required: "Email is required" })}
            placeholder="you@example.com"
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
          />
          {errors.email && (
            <p className="text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            {...register("password", {
              required: "Password is required",
              minLength: { value: 6, message: "Minimum 6 characters" },
            })}
            placeholder="••••••••"
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
          />
          {errors.password && (
            <p className="text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Role */}
        <div className="space-y-1">
          <label className="text-sm font-medium">Role</label>
          <select
            {...register("roleId", {
              valueAsNumber: true,
              required: "Role is required",
            })}
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>

          {errors.roleId && (
            <p className="text-xs text-red-600">{errors.roleId.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-black py-2.5 text-sm font-medium text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Creating account..." : "Register"}
        </button>
        <div className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="font-medium text-black hover:underline"
          >
            Sign in
          </button>
        </div>
      </form>
    </div>
  );
}

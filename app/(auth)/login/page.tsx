"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { loginAction, LoginActionResult } from "@/app/actions/auth.login";
import { JSX, useState } from "react";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginForm(): JSX.Element {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues): Promise<void> => {
    setServerError(null);

    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("password", values.password);

    const result: LoginActionResult = await loginAction(formData);

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    // router.push("/dashboard");
    // router.refresh();
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
            Welcome back
          </h1>
          <p className="text-sm text-gray-500">Sign in to your account</p>
        </div>

        {/* Server error */}
        {serverError && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            {serverError}
          </div>
        )}

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
            {...register("password", { required: "Password is required" })}
            placeholder="••••••••"
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
          />
          {errors.password && (
            <p className="text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-black py-2.5 text-sm font-medium text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Signing in..." : "Login"}
        </button>
        <div className="text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="font-medium text-black hover:underline"
          >
            Create one
          </button>
        </div>
      </form>
    </div>
  );
}

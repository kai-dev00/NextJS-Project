"use client";

import { useForm } from "react-hook-form";
import { loginAction } from "@/app/actions/auth.login";
import { JSX, useState } from "react";
import { CustomInput } from "@/components/CustomInput";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm(): JSX.Element {
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const result = await loginAction(values);
      if (result?.success) {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setServerError(err.message || "Login failed");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md space-y-5 rounded-xl border bg-white p-6 shadow-sm"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome to Bean Counter!
          </h1>
          <p className="text-sm text-gray-500">Log in to your account</p>
        </div>

        {serverError && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            {serverError}
          </div>
        )}
        <CustomInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <CustomInput
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          loading={isSubmitting}
          className="w-full"
        >
          Login
        </Button>
        <div className="text-center text-sm text-gray-600">
          <Link href="/forgotPassword" className="hover:underline">
            Forgot Password?
          </Link>
        </div>
      </form>
    </main>
  );
}

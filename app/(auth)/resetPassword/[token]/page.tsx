import ResetPasswordForm from "./form";
import prisma from "@/lib/prisma";

type PageProps = {
  params: {
    token: string;
  };
};

export default async function Page({ params }: PageProps) {
  const { token } = await params;

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">Invalid or missing reset token</p>
      </div>
    );
  }

  const reset = await prisma.passwordReset.findUnique({
    where: { token },
  });

  if (!reset) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-red-500">Invalid reset token</p>
          <p className="text-sm text-gray-600">
            This link may have been used or is incorrect.
          </p>
        </div>
      </div>
    );
  }

  if (reset.usedAt) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-red-500">This reset link has already been used</p>
          <p className="text-sm text-gray-600">
            Please request a new password reset.
          </p>
        </div>
      </div>
    );
  }

  if (reset.expiresAt < new Date()) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-red-500">This reset link has expired</p>
          <p className="text-sm text-gray-600">
            Please request a new password reset.
          </p>
        </div>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}

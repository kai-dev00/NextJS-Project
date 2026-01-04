import prisma from "@/lib/prisma";
import RegisterForm from "./form";

export default async function RegisterPage() {
  const roles = await prisma.role.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { id: "asc" },
  });

  return <RegisterForm roles={roles} />;
}

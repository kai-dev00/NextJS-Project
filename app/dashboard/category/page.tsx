import prisma from "@/lib/prisma";
import CategoryClient from "./client";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { id: "asc" },
  });

  return <CategoryClient categories={categories} />;
}

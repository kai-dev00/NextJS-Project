// app/api/test-edit-user/route.ts

import { editUserAction } from "@/app/dashboard/accessManagement/actions/edit.user";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await editUserAction({
      id: "some-user-id",
      email: "newemail@example.com",
      roleId: "some-role-id",
      isActive: true,
    });

    return NextResponse.json({
      message: "Edit succeeded (should not happen if unauthorized)",
    });
  } catch (e: any) {
    return NextResponse.json(
      {
        message: "Edit failed as expected",
        error: e.message,
      },
      { status: 403 },
    );
  }
}

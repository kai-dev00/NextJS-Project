"use client";

import { logoutAction } from "../app/actions/auth.logout";

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="rounded-md bg-black px-3 py-1.5 text-white hover:bg-gray-900"
      >
        Logout
      </button>
    </form>
  );
}

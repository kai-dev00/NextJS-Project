"use client";

import { useState } from "react";
import { BiLogOut } from "react-icons/bi";
import { logoutAction } from "../app/actions/auth.logout";
import { CustomModal } from "@/components/CustomModal";
import { Button } from "./ui/button";

type LogoutButtonProps = {
  variant?: "icon" | "text";
  className?: string;
};

export default function LogoutButton({
  variant = "icon",
  className = "",
}: LogoutButtonProps) {
  const [open, setOpen] = useState(false);
  const handleClick = (e: React.MouseEvent) => {
    // e.stopPropagation();
    setOpen(true);
  };
  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={handleClick}
          className={`cursor-pointer rounded-md bg-black px-3 py-1.5 text-white hover:bg-gray-900 ${className}`}
        >
          <BiLogOut />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className={`cursor-pointer w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors rounded ${className}`}
        >
          Logout
        </button>
      )}

      {/* Confirmation Modal */}
      <CustomModal
        open={open}
        onOpenChange={setOpen}
        title="Confirm logout"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant={"outline"}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <form action={logoutAction}>
              <Button type="submit" variant={"destructive"}>
                Logout
              </Button>
            </form>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          You will be signed out and redirected to the login page.
        </p>
      </CustomModal>
    </>
  );
}

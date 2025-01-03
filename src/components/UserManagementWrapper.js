"use client";
import { UserManagementTable } from "./UserManagement";
import { Providers } from "./Providers";

export default function UserManagementTableWrapper() {
  return (
    <Providers>
      <UserManagementTable />
    </Providers>
  );
}

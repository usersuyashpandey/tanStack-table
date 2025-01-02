import { Providers } from "@/components/Providers";
import { UserManagementTable } from "@/components/UserManagement";

export default function UsersPage() {
  return (
    <Providers>
      <main className="container mx-auto py-8">
        <UserManagementTable />
      </main>
    </Providers>
  );
}

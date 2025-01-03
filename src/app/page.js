import { Providers } from "@/components/Providers";
import { UserManagementTable } from "@/components/UserManagement";
import { Suspense } from "react";

export default function Home() {
  return (
    <Providers>
      <main className="container mx-auto py-8">
        <Suspense fallback={<div>Loading...</div>}>
          <UserManagementTable />
        </Suspense>
      </main>
    </Providers>
  );
}

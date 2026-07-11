import { AdminLayout } from "@/components/admin-layout";
import { AdminProviders } from "@/providers/admin-providers";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminProviders>
      <AdminLayout>{children}</AdminLayout>
    </AdminProviders>
  );
}

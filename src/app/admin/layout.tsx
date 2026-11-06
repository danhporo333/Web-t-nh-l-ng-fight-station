import { requireOwner } from "@/lib/auth";
import { LogoutButton } from "@/features/auth";
import { AppHeader } from "@/shared/components/app-header";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireOwner();

  return (
    <>
      <AppHeader
        homeHref="/admin"
        userName={user.fullName}
        nav={[
          { href: "/admin", label: "Tổng quan" },
          { href: "/admin/staff", label: "Nhân viên" },
          { href: "/admin/attendance", label: "Chấm công" },
          { href: "/admin/rates", label: "Mức lương" },
          { href: "/admin/shifts", label: "Cài đặt ca" },
          { href: "/change-password", label: "Đổi mật khẩu" },
        ]}
        actions={<LogoutButton />}
      />
      {children}
    </>
  );
}

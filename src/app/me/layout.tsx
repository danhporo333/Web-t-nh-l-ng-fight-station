import { requireUser } from "@/lib/auth";
import { LogoutButton } from "@/features/auth";
import { AppHeader } from "@/shared/components/app-header";

export default async function MeLayout({ children }: LayoutProps<"/me">) {
  const user = await requireUser();

  return (
    <>
      <AppHeader
        homeHref="/me"
        userName={user.fullName}
        nav={[
          { href: "/me", label: "Lương của tôi" },
          { href: "/change-password", label: "Đổi mật khẩu" },
        ]}
        actions={<LogoutButton />}
      />
      {children}
    </>
  );
}

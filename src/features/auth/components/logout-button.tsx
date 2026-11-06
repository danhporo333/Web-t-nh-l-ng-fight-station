import { logout } from "../actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button type="submit" className="h-10 rounded-md border border-zinc-300 px-4 text-sm">
        Đăng xuất
      </button>
    </form>
  );
}

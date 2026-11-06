import { logout } from "../actions";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="h-9 rounded-lg border border-stone-300 bg-white px-3 text-sm font-medium text-stone-800 hover:bg-stone-50"
      >
        Đăng xuất
      </button>
    </form>
  );
}

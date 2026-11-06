# auth

Đăng nhập, đăng xuất, đổi mật khẩu. Bảng: users. Xem SPEC.md mục 6 và API_SPEC.md (auth).

- `actions.ts`: `login` (đúng thì tạo cookie phiên rồi chuyển `/admin` hoặc `/me`), `logout`, `changePassword`. Đăng nhập sai trả `AUTH_001`, mật khẩu cũ sai `AUTH_004`.
- `service.ts`: `verifyLogin` (so bcrypt, tài khoản khóa coi như sai, có hash giả để khó dò tên đăng nhập), `changeUserPassword`.
- `queries.ts`: truy cập `users`. `schemas.ts`: zod, mật khẩu mới 6-72 ký tự, phải khác mật khẩu cũ.
- Component: `LoginForm`, `ChangePasswordForm`, `LogoutButton`, export qua `index.ts`.
- Trang: `/login`, `/change-password`. `LogoutButton` và link đổi mật khẩu nằm ở `/admin` và `/me`.
- Chưa có giới hạn số lần đăng nhập sai.

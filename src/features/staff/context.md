# staff

Quản lý nhân viên: tạo, sửa tên và lương mặc định, đặt lại mật khẩu, cho nghỉ việc. Bảng: users. Xem SPEC.md mục 7 (chủ quán).

- Trang `/admin/staff`: hiện danh sách nhân viên (mỗi người bấm mở ra sửa, đặt lại mật khẩu, nghỉ việc/kích hoạt lại). Nút "+ Thêm nhân viên" mở form tạo (`AddStaffPanel`), tạo xong form tự đóng.
- `actions.ts`: `createStaff`, `updateStaff`, `resetPassword`, `setStaffActive`. Mỗi action gọi `requireOwner()` trước. Lỗi lương mặc định trả `RATE_001`, lỗi dữ liệu khác `COMMON_001`.
- `service.ts`: `listStaff` (chỉ role STAFF, không trả `passwordHash`), `createStaffAccount` (trùng tên: `STAFF_001`), `updateStaffAccount`, `resetStaffPassword` (không thấy: `STAFF_002`), `changeStaffActive` (chủ quán: `STAFF_003`).
- Tài khoản chủ quán không hiện trong danh sách và không sửa, đặt lại mật khẩu được ở đây (chủ quán tự đổi ở `/change-password`).
- `users.default_rate` (cột tùy chọn) chỉ để feature `rates` dùng khi tạo mức lương tháng đầu. Đổi nó không đổi các tháng đã có.
- Tên đăng nhập: 3-50 ký tự, chữ thường, số, `. _ -`. Mật khẩu 6-72 ký tự. Ô mật khẩu ở form tạo và đặt lại hiện chữ thường để chủ quán đọc cho nhân viên.

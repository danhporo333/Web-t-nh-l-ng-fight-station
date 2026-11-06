# shifts

Cài đặt hai ca (giờ, số giờ và mức mặc định). Bảng: shifts. Xem DATABASE..md.

- Trang `/admin/shifts`: mỗi ca một form sửa giờ bắt đầu, giờ kết thúc, số giờ mặc định, mức mặc định. Không sửa tên và mã ca.
- `getShifts` (đọc, mọi người dùng đã đăng nhập; trang tự gọi `requireOwner`), `updateShift` (Action, chỉ chủ quán). Dữ liệu sai trả `SHIFT_001`.
- Giờ dạng HH:MM. Số giờ lớn hơn 0 và không quá 24, nhận cả dấu phẩy ("8,5"). Mức là số nguyên dương.
- Mức mặc định chỉ dùng khi feature `rates` tạo mức lương cho người chưa có. Đổi ở đây không đổi các tháng đã có.
- Ca chiều kết thúc 02:00 hôm sau, ứng dụng tự hiểu; `end_time` chỉ để hiển thị.

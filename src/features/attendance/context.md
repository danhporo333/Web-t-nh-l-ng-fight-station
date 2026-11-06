# attendance

Chấm công theo ngày: ca sáng, ca chiều, Off, sửa giờ. Bảng: work_entries, shifts, users. Xem SPEC.md mục 2.

- Trang `/admin/attendance?date=YYYY-MM-DD` (mặc định hôm nay theo giờ Việt Nam): chọn ngày bằng `DatePicker` (nút ‹ ›, hoặc ô lịch: chọn ngày là chuyển ngay, không cần bấm nút), mỗi nhân viên đang làm một thẻ có ba nút Ca sáng, Ca chiều, Off.
- Tích ca thì hiện ô giờ tự điền `shifts.default_hours` (sửa được) và ô ghi chú. Tích Off thì bỏ các ca, tích ca thì bỏ Off.
- `getDayEntries(date)` (đọc): trả `{ date, defaultHours, rows }`, mỗi dòng có `off`, `morning`, `afternoon`.
- `saveDayEntries` (Action, chỉ chủ quán): lưu cả ngày cho mọi người trong form. Kiểu thay thế: xóa dòng cũ của những người đó trong ngày rồi ghi mới, trong một giao dịch. Người không tích gì thì không có dòng nào (xóa chấm công cũ của ngày đó).
- Mã lỗi: `ATT_001` số giờ ngoài (0, 24], `ATT_002` vừa Off vừa có ca, `ATT_003` nhân viên đã nghỉ việc, `STAFF_002` không có nhân viên, `COMMON_002` ngày sai.
- Ca chiều tính vào ngày bắt đầu ca (`work_date`), kể cả khi kết thúc 02:00 hôm sau. Ngày Off là một dòng `is_off = true`, `shift_id` trống, `hours = 0`. Mỗi người tối đa một dòng Off mỗi ngày do `replaceDayEntries` xóa rồi ghi lại.
- Chỉ hiện nhân viên đang làm. Chưa kiểm tra mức lương của tháng ở đây, thiếu mức sẽ báo `RATE_002` ở bảng lương.

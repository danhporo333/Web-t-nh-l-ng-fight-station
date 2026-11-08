# attendance

Chấm công theo ngày: ca sáng, ca chiều, Off, sửa giờ, ngày lễ. Bảng: work_entries, shifts, users, holiday_days. Xem SPEC.md mục 2.

- Trang `/admin/attendance?date=YYYY-MM-DD` (mặc định hôm nay theo giờ Việt Nam): chọn ngày bằng `DatePicker` (nút ‹ ›, hoặc ô lịch: chọn ngày là chuyển ngay, không cần bấm nút), mỗi nhân viên đang làm một thẻ có ba nút Ca sáng, Ca chiều, Off.
- Lưu xong hiện thông báo trượt từ phải sang ở góc trên phải (`ActionToast`, xanh khi thành công, đỏ khi lỗi, tự ẩn sau khoảng 3,5 giây), không còn dòng chữ nhỏ dưới nút Lưu.
- Tích ca thì hiện ô giờ tự điền `shifts.default_hours` (sửa được) và ô ghi chú. Tích Off thì bỏ các ca, tích ca thì bỏ Off.
- Ô "Ngày lễ (lương ca nhân đôi)" (`HolidayToggle`) nằm trên đầu form. Tích thì hiện ô "Tên ngày lễ" (bắt buộc, lỗi `ATT_004` nếu trống). Trạng thái lưu trong bảng `holiday_days`, một dòng mỗi ngày.
- `getDayEntries(date)` (đọc): trả `{ date, defaultHours, holiday, rows }`, `holiday` là tên ngày lễ hoặc null, mỗi dòng có `off`, `morning`, `afternoon`.
- `getMonthHours(month)` tách giờ rơi vào ngày lễ thành `morningHolidayHours`, `afternoonHolidayHours` để payroll nhân đôi. `getUserMonthDays` gắn `holiday` (tên lễ) cho từng ngày.
- `saveDayEntries` (Action, chỉ chủ quán): lưu cả ngày cho mọi người trong form và trạng thái ngày lễ. Kiểu thay thế: xóa dòng cũ của những người đó trong ngày rồi ghi mới, trong một giao dịch. Người không tích gì thì không có dòng nào (xóa chấm công cũ của ngày đó).
- Mã lỗi: `ATT_001` số giờ ngoài (0, 24], `ATT_002` vừa Off vừa có ca, `ATT_003` nhân viên đã nghỉ việc, `ATT_004` tích ngày lễ mà thiếu tên, `STAFF_002` không có nhân viên, `COMMON_002` ngày sai.
- Ca chiều tính vào ngày bắt đầu ca (`work_date`), kể cả khi kết thúc 02:00 hôm sau. Ngày Off là một dòng `is_off = true`, `shift_id` trống, `hours = 0`. Mỗi người tối đa một dòng Off mỗi ngày do `replaceDayEntries` xóa rồi ghi lại.
- Chỉ hiện nhân viên đang làm. Chưa kiểm tra mức lương của tháng ở đây, thiếu mức sẽ báo `RATE_002` ở bảng lương.

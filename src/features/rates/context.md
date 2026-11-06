# rates

Mức lương từng người từng tháng, tự chép từ tháng trước. Bảng: monthly_rates, shifts, users. Xem SPEC.md mục 2.

- Trang `/admin/rates?month=YYYY-MM` (mặc định tháng hiện tại theo giờ Việt Nam): chọn tháng bằng `MonthPicker`, mỗi nhân viên đang làm một thẻ với hai ô ca sáng, ca chiều.
- Hàm đọc `getMonthlyRates(month)`: mọi nhân viên đang làm, mức là `null` nếu chưa có dòng của tháng.
- `ensureMonthRates` (Action): tạo dòng còn thiếu theo thứ tự (1) dòng tháng trước, (2) `users.default_rate` dùng cho cả hai ca, (3) mức mặc định từng ca trong `shifts`. Không ghi đè dòng đã có, chạy lại nhiều lần cho cùng kết quả (`createMany` với `skipDuplicates`). Logic chọn mức là hàm thuần `resolveInitialRates` trong `utils.ts`.
- Tự động cho tháng hiện tại: `autoEnsureMonthRates(month)` gọi `ensureMonthRatesFor` khi chủ quán mở Chấm công, Mức lương, Bảng lương (cả trang chi tiết) của tháng hiện tại theo giờ Việt Nam. Nhờ đó không phải bấm nút mỗi đầu tháng, và nhân viên mới thêm giữa tháng tự có mức. Các tháng khác (đã qua hoặc chưa tới) không tự tạo, chủ quán bấm "Tạo mức lương tháng này" hoặc "Tạo mức còn thiếu" để tránh sinh mức lương lịch sử âm thầm. Trang `/me` của nhân viên không kích hoạt việc ghi này.
- `saveMonthlyRates` (Action): lưu mức của các người có dòng trong tháng. Mức phải là số nguyên dương (`RATE_001`), người chưa có dòng của tháng trả `RATE_002`. Ghi trong một giao dịch.
- Chỉ nhân viên đang làm (`is_active`) được tạo dòng mới. Dòng của người đã nghỉ giữ nguyên để tính lương cũ.
- Mức lương chỉ đổi theo tháng, không đổi giữa tháng.

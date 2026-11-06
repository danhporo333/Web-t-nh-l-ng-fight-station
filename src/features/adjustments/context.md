# adjustments

Thưởng và phạt kèm lý do, tính theo tháng của ngày ghi nhận. Bảng: adjustments, users. Xem SPEC.md mục 4.

- Loại lỗi (`category`, tối đa 50 ký tự, tùy chọn) tự đặt, chỉ lưu cho khoản phạt (khoản thưởng luôn bỏ loại). Ô nhập gợi ý các loại đã dùng (`getCategoryOptions`, `CategoryDatalist`). `getPenaltyBreakdown(month)` trả số lần và tiền phạt theo nhân viên và loại lỗi cho feature `stats`.

- Trang `/admin/adjustments?month=YYYY-MM&userId=<id>` (mặc định tháng hiện tại, mọi nhân viên): chọn tháng, lọc theo nhân viên, hai ô tổng thưởng và tổng phạt, nút "+ Thêm thưởng phạt" mở form, danh sách khoản (bấm mở ra sửa hoặc xóa).
- `listAdjustments(month, userId?)` (đọc): lọc bằng khoảng `>= đầu tháng` và `< đầu tháng sau`, mới nhất trước. `getStaffOptions()` cho ô chọn nhân viên (chỉ đang làm).
- Action (chỉ chủ quán, gọi `requireOwner()` trước): `createAdjustment`, `updateAdjustment` (sửa ngày, loại, số tiền, lý do; không đổi nhân viên), `deleteAdjustment` (hỏi xác nhận ở trình duyệt).
- Số tiền luôn là số nguyên dương, tối đa 100.000.000; loại `BONUS` hoặc `PENALTY` quyết định cộng hay trừ.
- Mã lỗi: `ADJ_001` số tiền, `ADJ_002` thiếu lý do (hoặc quá 255 ký tự), `ADJ_003` không tìm thấy khoản, `STAFF_002` không có nhân viên, `COMMON_002` ngày sai.
- Khoản tính vào tháng của `date`. Sửa ngày sang tháng khác thì khoản chuyển tháng. Thêm cho nhân viên đã nghỉ việc không chặn ở server, nhưng ô chọn chỉ liệt kê người đang làm.
- `summarizeAdjustments` (utils) cộng tổng thưởng, phạt; dùng cho trang này và sau này cho `payroll`.

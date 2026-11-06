# stats

Thống kê ngày nghỉ, lỗi và tiền phạt theo tháng. Đọc attendance và adjustments qua index.ts, tự đọc bảng users để lấy tên. Chỉ đọc, không có Server Action.

- Trang `/admin/stats?month=YYYY-MM` (mặc định tháng hiện tại, chỉ chủ quán): ba ô tổng (ngày nghỉ, số lần phạt, tiền phạt), bảng theo loại lỗi, rồi mỗi nhân viên một thẻ (số ngày nghỉ và từng ngày nghỉ ghi đầy đủ kèm thứ, ví dụ "Thứ năm, 05/11/2026", số lần phạt, tiền phạt, tách theo loại lỗi, link sang các khoản phạt).
- `getMonthStats(month)` (đọc, không kiểm quyền bên trong; trang gọi `requireOwner()`). Dữ liệu: `getMonthOffDays` (attendance), `getPenaltyBreakdown` (adjustments).
- `buildMonthStats` (utils.ts, hàm thuần, có test) gộp dữ liệu. Loại lỗi gộp không phân biệt hoa thường và khoảng trắng thừa. Khoản phạt không có loại gom vào "Chưa phân loại".
- Ngày nghỉ là các dòng Off trong chấm công, mỗi ngày tính một lần. Chỉ tính khoản `PENALTY`, không tính thưởng.
- Nhân viên có trong thống kê: mọi người đang làm (kể cả 0) và người đã nghỉ việc nhưng có ngày nghỉ hoặc khoản phạt trong tháng.
- Loại lỗi là chữ tự đặt, lưu ở cột `adjustments.category` (feature adjustments). Chưa có trang quản lý danh sách loại lỗi; ô nhập gợi ý các loại đã dùng.

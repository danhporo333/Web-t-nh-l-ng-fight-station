# payroll

Bảng lương tháng và chi tiết từng ngày. Hàm thuần calculatePay. Đọc rates, attendance, adjustments qua index.ts. Xem SPEC.md mục 3.

- Trang `/admin/payroll?month=YYYY-MM` (mặc định tháng hiện tại): mỗi nhân viên một thẻ (giờ sáng, giờ chiều, mức, lương ca, thưởng phạt, thực lãnh). Bấm thẻ vào `/admin/payroll/<userId>?month=...` xem từng ngày và từng khoản thưởng phạt kèm lý do.
- `getMonthlyPayroll(month)` và `getStaffMonthDetail(userId, month)` (đọc). Không kiểm quyền bên trong: trang của chủ quán gọi `requireOwner()`; feature `me` sẽ gọi `getStaffMonthDetail` với `userId` lấy từ phiên.
- Dữ liệu lấy qua `index.ts` của các feature khác: `getMonthHours`, `getUserMonthDays` (attendance), `getRatesForMonth` (rates), `getAdjustmentTotals`, `listAdjustments` (adjustments). Payroll chỉ tự đọc bảng `users` để lấy tên.
- `calculatePay` (utils.ts, hàm thuần, có test): `shiftPay = round(giờ sáng × mức sáng + giờ chiều × mức chiều)`, `netPay = shiftPay + thưởng − phạt − ăn uống`. Cộng giờ trước, nhân mức và làm tròn một lần.
- Nhân viên có mặt trong bảng: mọi người đang làm (kể cả 0 giờ) và người đã nghỉ việc nhưng có chấm công hoặc thưởng phạt trong tháng.
- Thiếu mức lương (RATE_002): hàm đọc không ném lỗi. Nếu nhân viên có giờ làm mà tháng chưa có dòng mức thì `missingRate = true`, `shiftPay` và `netPay` là `null`, giao diện báo và dẫn tới `/admin/rates`. Tổng cả tháng không cộng người này. Không có giờ làm thì thiếu mức vẫn cho 0đ.
- Tiền từng ngày ở trang chi tiết là `round(giờ × mức)` của từng ca, chỉ để xem. Tổng tháng tính trên tổng giờ nên có thể lệch vài đồng với tổng các dòng ngày khi mức lương không tròn trăm.
- Ca chiều tính vào ngày bắt đầu ca (ví dụ ca chiều 31/10 vào lương tháng 10). Tháng lọc theo khoảng `>= đầu tháng` và `< đầu tháng sau` (`monthRange`).

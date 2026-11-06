# me

Trang Lương của tôi cho nhân viên. userId luôn lấy từ phiên. Xem SPEC.md mục 7 (nhân viên).

- Trang `/me?month=YYYY-MM` (mặc định tháng hiện tại): chọn tháng, rồi cùng giao diện chi tiết với trang chủ quán (`StaffMonthDetailView` của payroll): các con số, từng ngày đã làm, thưởng phạt kèm lý do, thực lãnh.
- `getMyPayroll(userId, month)` (đọc) chỉ gọi `getStaffMonthDetail` của payroll qua `index.ts`. Trang gọi `requireUser()` rồi truyền `user.id` từ phiên. URL chỉ có `month`, không có `userId`, nên nhân viên không xem được lương người khác.
- Tài khoản chủ quán vào `/me` thấy thông báo không có bảng lương (`getStaffMonthDetail` chỉ trả dữ liệu cho role STAFF).
- Ngoại lệ so với quy tắc "feature không gọi nhau": `me` đọc kết quả tính lương từ `payroll` để không viết lại công thức. Công thức vẫn chỉ nằm ở `payroll/utils.ts`.
- Nhân viên đã nghỉ việc không đăng nhập được nên không vào được trang này.

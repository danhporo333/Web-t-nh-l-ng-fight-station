import { getStaffMonthDetail, type StaffMonthDetail } from "@/features/payroll";

// userId PHẢI lấy từ phiên đăng nhập (requireUser), không bao giờ từ tham số của trang hay của client.
// Tài khoản chủ quán không có bảng lương nên trả null.
export function getMyPayroll(userId: number, month: string): Promise<StaffMonthDetail | null> {
  return getStaffMonthDetail(userId, month);
}

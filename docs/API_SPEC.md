# API_SPEC: Web tính lương Fight Station

Mô tả các thao tác dữ liệu của dự án. Dự án là một app Next.js, **không có REST API riêng**: đọc dữ liệu bằng Server Component, ghi bằng **Server Action**. File này liệt kê các Server Action và hàm đọc theo từng feature, kèm quyền và định dạng kết quả. Đọc kèm `DATABASE..md` và `ARCHITECTURE.md`.

## 1. Tổng quan

- **Cách gọi:** Server Action gọi trực tiếp từ form hoặc từ component. Không có base URL.
- **Phiên bản:** không dùng versioning. Nếu sau này cần REST cho ứng dụng di động, thêm Route Handler dưới `/api/v1/`.
- **Dữ liệu vào:** `FormData` từ form. Tháng dạng `YYYY-MM`, ngày dạng `YYYY-MM-DD`, tiền là số nguyên đồng, giờ là số thập phân tối đa 2 chữ số.
- **Múi giờ:** `Asia/Ho_Chi_Minh`.

## 2. Xác thực

- **Phương thức:** cookie phiên `session`, JWT HS256, ký bằng `SESSION_SECRET`.
- **Cookie:** httpOnly, sameSite lax, secure khi production, hết hạn sau 7 ngày. Không có refresh token. Hết hạn thì đăng nhập lại.
- **Payload:** `{ userId, role }`, `role` là `OWNER` hoặc `STAFF`.
- **Kiểm tra:** mọi Server Action gọi `requireUser()` hoặc `requireOwner()`. Hàm này tra DB, chặn tài khoản `is_active = false`.
- **Lỗi xác thực:** chưa đăng nhập thì chuyển về `/login`. Sai quyền thì chuyển về `/me`. Với Server Action trả `AUTH_002` hoặc `AUTH_003`.

## 3. Quy ước dữ liệu vào

- Tháng: `month=2026-11`. Ngày: `date=2026-11-05`.
- Không có phân trang: số nhân viên và số dòng mỗi tháng nhỏ.
- Sắp xếp mặc định: nhân viên theo `full_name`, chấm công theo `work_date` giảm dần.
- Số tiền thưởng phạt luôn dương. Loại (`BONUS`, `PENALTY`) quyết định dấu.
- Không có upload file.

## 4. Định dạng kết quả

Mọi Server Action ghi trả về cùng một dạng:

```ts
type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; details?: unknown } };
```

Thành công:

```json
{ "success": true, "data": { "saved": 2 } }
```

Lỗi:

```json
{
  "success": false,
  "error": {
    "code": "ATT_002",
    "message": "Ngày này đã đánh dấu Off, không thể thêm ca.",
    "details": { "userId": 3, "date": "2026-11-04" }
  }
}
```

Hàm đọc dữ liệu (chạy ở Server Component) trả thẳng dữ liệu, không bọc. Lỗi nghiêm trọng thì ném lỗi để `error.tsx` bắt.

## 5. Mã lỗi

Mã có dạng `[FEATURE]_[SỐ]`.

**Chung**

| Mã | Ý nghĩa |
| --- | --- |
| `COMMON_001` | Dữ liệu không hợp lệ (zod), `details` chứa lỗi từng trường |
| `COMMON_002` | Tháng hoặc ngày sai định dạng |
| `COMMON_003` | Lỗi hệ thống, thử lại sau |

**Theo feature**

| Mã | Ý nghĩa |
| --- | --- |
| `AUTH_001` | Sai tên đăng nhập hoặc mật khẩu |
| `AUTH_002` | Chưa đăng nhập |
| `AUTH_003` | Không đủ quyền |
| `AUTH_004` | Mật khẩu cũ không đúng |
| `STAFF_001` | Tên đăng nhập đã tồn tại |
| `STAFF_002` | Không tìm thấy nhân viên |
| `STAFF_003` | Không thể khóa tài khoản chủ quán |
| `SHIFT_001` | Giờ hoặc mức mặc định không hợp lệ |
| `RATE_001` | Mức lương phải là số nguyên dương (áp dụng cả lương mặc định của nhân viên) |
| `RATE_002` | Chưa có mức lương của tháng này, cần chép từ tháng trước |
| `ATT_001` | Số giờ không hợp lệ (nhỏ hơn 0 hoặc lớn hơn 24) |
| `ATT_002` | Ngày đã Off nhưng có ca, hoặc có ca nhưng đánh dấu Off |
| `ATT_003` | Nhân viên đã nghỉ việc, không chấm công được |
| `ADJ_001` | Số tiền phải là số nguyên dương |
| `ADJ_002` | Thiếu lý do |
| `ADJ_003` | Không tìm thấy khoản thưởng phạt |

Kiểm quyền: `AUTH_*` thay cho mã HTTP. Dự án không trả mã HTTP tùy chỉnh vì dùng Server Action.

## 6. Danh sách theo feature

Cột Auth: `Owner` chỉ chủ quán, `User` mọi người đã đăng nhập, `Public` ai cũng gọi được.

### auth

| Hàm | Loại | Mô tả | Auth |
| --- | --- | --- | --- |
| `login` | Action | Đăng nhập bằng username, password | Public |
| `logout` | Action | Xóa cookie, về `/login` | User |
| `changePassword` | Action | Đổi mật khẩu của chính mình | User |

### staff

| Hàm | Loại | Mô tả | Auth |
| --- | --- | --- | --- |
| `listStaff` | Đọc | Danh sách nhân viên, lọc theo `is_active` | Owner |
| `createStaff` | Action | Tạo tài khoản nhân viên, có thể kèm lương mặc định mọi ca (`defaultRate`, tùy chọn) | Owner |
| `updateStaff` | Action | Sửa họ tên và lương mặc định mọi ca (không đổi các tháng đã có) | Owner |
| `resetPassword` | Action | Đặt lại mật khẩu cho nhân viên | Owner |
| `setStaffActive` | Action | Cho nghỉ việc hoặc kích hoạt lại | Owner |

### shifts

| Hàm | Loại | Mô tả | Auth |
| --- | --- | --- | --- |
| `getShifts` | Đọc | Hai ca và mức mặc định | User |
| `updateShift` | Action | Sửa giờ, số giờ và mức mặc định | Owner |

### rates

| Hàm | Loại | Mô tả | Auth |
| --- | --- | --- | --- |
| `getMonthlyRates` | Đọc | Mức lương mọi nhân viên của một tháng | Owner |
| `ensureMonthRates` | Action | Nếu tháng chưa có thì chép từ tháng trước (hoặc mức mặc định) | Owner |
| `saveMonthlyRates` | Action | Lưu mức sáng và chiều của một số nhân viên trong tháng | Owner |

### attendance

| Hàm | Loại | Mô tả | Auth |
| --- | --- | --- | --- |
| `getDayEntries` | Đọc | Chấm công của mọi nhân viên trong một ngày | Owner |
| `saveDayEntries` | Action | Lưu ca, giờ, Off của một ngày | Owner |

### adjustments

| Hàm | Loại | Mô tả | Auth |
| --- | --- | --- | --- |
| `listAdjustments` | Đọc | Thưởng phạt theo tháng, có thể lọc theo nhân viên | Owner |
| `createAdjustment` | Action | Thêm thưởng hoặc phạt | Owner |
| `updateAdjustment` | Action | Sửa | Owner |
| `deleteAdjustment` | Action | Xóa | Owner |

### payroll

| Hàm | Loại | Mô tả | Auth |
| --- | --- | --- | --- |
| `getMonthlyPayroll` | Đọc | Bảng lương mọi nhân viên của một tháng | Owner |
| `getStaffMonthDetail` | Đọc | Chi tiết từng ngày của một nhân viên trong tháng | Owner |

### me

| Hàm | Loại | Mô tả | Auth |
| --- | --- | --- | --- |
| `getMyPayroll` | Đọc | Lương của chính mình, `userId` lấy từ phiên, không từ tham số | User |

## 7. Chi tiết các hàm phức tạp

### `saveDayEntries`

Lưu chấm công của một ngày cho nhiều nhân viên cùng lúc.

Vào:

```json
{
  "date": "2026-11-05",
  "entries": [
    { "userId": 3, "morning": { "hours": 8.5 }, "afternoon": { "hours": 10 } },
    { "userId": 4, "morning": { "hours": 5.5, "note": "về sớm lúc 13h" } },
    { "userId": 5, "off": true }
  ]
}
```

Quy tắc:
- Mỗi người một mục. `morning` và `afternoon` có thể có một hoặc cả hai.
- Có `off: true` thì không được kèm ca (`ATT_002`).
- Ô giờ tự điền từ `shifts.default_hours` ở giao diện. Server vẫn kiểm tra `0 < hours <= 24` (`ATT_001`).
- Ca chiều dùng `date` là ngày bắt đầu ca.
- Ghi theo kiểu thay thế: các dòng cũ của người đó trong ngày bị xóa, rồi ghi mới trong một giao dịch.
- Nhân viên có `is_active = false` bị từ chối (`ATT_003`).

Ra:

```json
{ "success": true, "data": { "saved": 3 } }
```

### `ensureMonthRates`

Vào: `month=2026-11`.

Quy tắc, theo thứ tự cho từng nhân viên đang hoạt động chưa có dòng của tháng:
1. Có dòng tháng trước thì chép `morning_rate`, `afternoon_rate` sang.
2. Không có, mà nhân viên có `users.default_rate` thì dùng mức đó cho cả hai ca.
3. Không có cả hai thì lấy `default_rate` của từng ca trong bảng `shifts`.

Không ghi đè dòng đã có. Chạy lại nhiều lần cho cùng kết quả.

### `getMonthlyPayroll`

Vào: `month=2026-11`. Chỉ chủ quán.

Ra:

```json
[
  {
    "userId": 3,
    "fullName": "Hoàng",
    "morningHours": 14,
    "afternoonHours": 10,
    "morningRate": 26000,
    "afternoonRate": 28000,
    "shiftPay": 644000,
    "bonus": 50000,
    "penalty": 20000,
    "netPay": 674000
  }
]
```

Công thức (chi tiết ở `DATABASE..md`):

```
shiftPay = round(morningHours × morningRate + afternoonHours × afternoonRate)
netPay   = shiftPay + bonus − penalty
```

Lỗi có thể gặp: `RATE_002` nếu nhân viên có chấm công nhưng chưa có mức của tháng.

### `getMyPayroll`

Vào: `month=2026-11`. `userId` lấy từ phiên.

Ra: cùng cấu trúc một dòng của `getMonthlyPayroll`, thêm danh sách từng ngày và từng khoản thưởng phạt kèm lý do:

```json
{
  "summary": { "shiftPay": 644000, "bonus": 50000, "penalty": 20000, "netPay": 674000 },
  "days": [
    { "date": "2026-11-01", "shift": "MORNING", "hours": 8.5, "pay": 221000 },
    { "date": "2026-11-04", "off": true }
  ],
  "adjustments": [
    { "date": "2026-11-10", "type": "PENALTY", "amount": 20000, "reason": "đi trễ 30 phút" }
  ]
}
```

Nhân viên không bao giờ nhận được dữ liệu của người khác, kể cả khi sửa tham số gửi lên.

## 8. Bổ sung riêng cho Next.js

- Sau mỗi Server Action ghi thành công, gọi `revalidatePath` cho trang liên quan (ví dụ `/admin/payroll`, `/me`).
- Nếu sau này cần Route Handler (ví dụ cho ứng dụng di động), đặt ở `src/app/api/v1/...`, dùng lại đúng các `service` hiện có và cùng định dạng `ActionResult`.
- Không có GraphQL, WebSocket hay gRPC.

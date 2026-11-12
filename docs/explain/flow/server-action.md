# Giải thích flow: một Server Action từ giao diện đến database

- **Chế độ:** flow
- **Target:** luồng chung của một Server Action ghi dữ liệu (lấy `saveDayEntries` của `attendance` làm ví dụ)
- **Ngày viết:** 2026-11-12
- **Tài liệu đã đọc:** `docs/ARCHITECTURE.md` (mục 4, 5, 8), `docs/API_SPEC.md` (mục 2, 4, 5, 6, 7, 8), `docs/PROJECT-RULES.md` (mục 4), `node_modules/next/dist/docs/01-app/02-guides/server-actions.md`
- **Lưu ý:** viết từ tài liệu, không đọc source. Các Server Action khác (`createAdjustment`, `saveMonthlyRates`...) đi theo cùng khuôn này. Nếu cần bài riêng cho một hành động cụ thể, chạy `/explain flow <tên-hành-động>`, ví dụ `flow them-cham-cong`.
- Khái niệm Server Action là gì xem [concept/server-action.md](../concept/server-action.md).

## 🔄 Flow: Chủ quán lưu chấm công của một ngày (`saveDayEntries`)

### Tổng quan
Chủ quán tích ca, nhập giờ hoặc đánh dấu Off cho nhiều nhân viên trong một ngày, rồi bấm "Lưu". Dữ liệu đi qua 4 tầng (Server Action → service → queries → MySQL) và kết quả quay về form. Mọi Server Action ghi trong dự án đều theo khuôn này.

### Sơ đồ

```
[Trang /admin/attendance] Server Component đã gọi requireOwner() và getDayEntries(date)
    │  hiển thị form chấm công
    ▼
[Form (client)] chủ quán tích ca, nhập giờ, bấm "Lưu"
    │  useActionState gửi FormData
    ▼
[Next.js] gửi POST tới chính trang đó (đã qua proxy.ts, có cookie)
    │
    ▼
[Server Action: saveDayEntries]
    │  1. requireOwner()      → AUTH_002 / AUTH_003 nếu không hợp lệ
    │  2. validate (zod)      → fail("ATT_001", ...) nếu sai
    │  3. gọi service
    ▼
[service: saveEntries] business logic
    │  chặn Off trùng ca (ATT_002), chặn nhân viên đã nghỉ việc (ATT_003)
    │  mở một giao dịch: xóa dòng cũ của người đó trong ngày, ghi dòng mới
    ▼
[queries] Prisma, nơi duy nhất gọi database
    ▼
[MySQL]
    ▼
[Server Action] trả kết quả
    │  { success: true, data: { saved: 3 } }
    │  hoặc { success: false, error: { code, message, details } }
    ▼
[Form] useActionState nhận kết quả, hiện lỗi hoặc báo thành công
    │  revalidatePath("/admin/attendance") giúp dữ liệu mới hiện ngay
    ▼
[Trang] được render lại, trong cùng một lần gọi
```

### Chi tiết từng bước

**Bước 0: Trang được mở (trước khi có Server Action)**
- `proxy.ts` chỉ kiểm tra có cookie phiên hay chưa. Chưa có thì chuyển về `/login`.
- Trang (Server Component) tự gọi `requireOwner()`. Hàm này tra DB và chặn tài khoản đã khóa. Nó đọc dữ liệu bằng `getDayEntries` rồi render form.

**Bước 1: Form gửi dữ liệu**
- Chủ quán nhập xong, bấm "Lưu". `useActionState` gọi Server Action với `FormData`.
- Giao diện tự điền giờ mặc định từ `shifts.default_hours`, nhưng đó chỉ là tiện lợi cho người dùng. Server vẫn kiểm tra lại.
- Trong lúc chờ, `pending` bật để vô hiệu nút.

**Bước 2: Request tới server**
- Server Action thực chất là một POST. Next.js tự kiểm tra `Origin` và giới hạn body 1MB.
- Các action của cùng một client chạy lần lượt, không song song.

**Bước 3: Kiểm quyền (`requireOwner()`)**
- Đây là hàng rào thật. Ẩn nút hay `proxy.ts` không thay thế được.
- Không hợp lệ: trả `AUTH_002` (chưa đăng nhập) hoặc `AUTH_003` (không đủ quyền).

**Bước 4: Validate (zod)**
- Ngày dạng `YYYY-MM-DD`, giờ `0 < hours <= 24`. Sai thì trả `fail(...)`, không đi tiếp.
- Mã lỗi theo `API_SPEC.md` mục 5.

**Bước 5: Service (business logic)**
- Có `off: true` mà kèm ca thì lỗi `ATT_002`. Nhân viên đã nghỉ việc thì lỗi `ATT_003`.
- Ghi theo kiểu **thay thế**: xóa dòng cũ của người đó trong ngày, ghi mới, tất cả trong **một giao dịch**. Nhờ vậy lỗi giữa chừng không để dữ liệu nửa vời.
- Lỗi Prisma được bắt ở service và đổi thành mã lỗi, không để lộ thông báo DB ra giao diện.

**Bước 6: Queries và MySQL**
- Chỉ `queries.ts` gọi Prisma.

**Bước 7: Trả kết quả và cập nhật giao diện**
- Server Action trả `ActionResult`, và `revalidatePath` được gọi cho các trang liên quan.
- Theo tài liệu Next.js 16, khi action gọi `revalidatePath`, `redirect` hoặc đổi cookie, Next.js render lại trang hiện tại và gửi **cùng một response** với kết quả. Không cần fetch thêm.
- Lương không được tính ở bước này. Bảng lương được tính khi chủ quán mở `/admin/payroll` (hàm `getMonthlyPayroll`).

### Điểm khác nhau giữa các loại action
| Loại | Cách kết thúc |
| --- | --- |
| Ghi dữ liệu thường | Trả `{ success, data }` và gọi `revalidatePath` |
| `login` | Tạo cookie, rồi `redirect` sang `/admin` hoặc `/me` |
| `logout` | Xóa cookie, về `/login` |

Lưu ý với `redirect`: code sau nó không chạy, nên phải gọi `revalidatePath` trước.

### 🔍 Mẹo debug
- `AUTH_002`/`AUTH_003`: phiên hết hạn (7 ngày) hoặc tài khoản không phải OWNER hoặc đã bị khóa. Xem `requireOwner()` trong `lib/auth.ts`.
- `COMMON_001` hoặc `ATT_001`: xem `details` trong kết quả để biết trường nào sai.
- `ATT_002`: ngày đó vừa Off vừa có ca. Bỏ một trong hai.
- Lưu xong mà trang không đổi: kiểm tra Server Action có gọi `revalidatePath` đúng đường dẫn không.
- `COMMON_003` hoặc lỗi 500: xem `console.error` trên server hoặc log Vercel. Log có mã lỗi và id người dùng, không có mật khẩu hay token.
- Form không hiện lỗi: kiểm tra component có đọc state từ `useActionState` không.

### 🔗 Liên kết
- Tài liệu: `ARCHITECTURE.md` mục 4 (luồng request) và mục 8 (quản lý dữ liệu), `API_SPEC.md` mục 4 (định dạng kết quả), mục 5 (mã lỗi) và mục 7 (`saveDayEntries`), `PROJECT-RULES.md` mục 4.
- Bài liên quan: [concept/server-action.md](../concept/server-action.md), [code/auth.md](../code/auth.md).

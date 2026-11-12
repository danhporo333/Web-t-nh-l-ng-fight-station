# Giải thích concept: xác thực và phân quyền (auth)

- **Chế độ:** concept
- **Target:** auth (xác thực và phân quyền)
- **Ngày viết:** 2026-11-12
- **Tài liệu đã đọc:** `docs/PROJECT-RULES.md`, `docs/ARCHITECTURE.md` (mục 5, 9, 10), `docs/API_SPEC.md` (mục 2, 5, 6)
- **Lưu ý:** viết từ tài liệu, không đọc source. Phần code của feature xem [code/auth.md](../code/auth.md).

## 🎯 Xác thực và phân quyền

### Là gì?
Hai câu hỏi khác nhau mà một web phải trả lời:
- **Xác thực (authentication):** "Bạn là ai?" Ở đây là kiểm tra tên đăng nhập và mật khẩu.
- **Phân quyền (authorization):** "Bạn được làm gì?" Ở đây là phân biệt chủ quán (`OWNER`) và nhân viên (`STAFF`).

### Ví dụ đời thường
Giống việc vào quán bằng thẻ nhân viên:
- Quẹt thẻ ở cửa là **xác thực**. Sau đó bạn được phát một vòng đeo tay (cookie phiên).
- Cửa quay ở lối vào chỉ nhìn xem bạn có vòng tay hay chưa (`proxy.ts`).
- Phòng quản lý còn có bảo vệ riêng, kiểm tra vòng tay đó có phải của OWNER không và tài khoản còn hoạt động không (`requireOwner()`). Đó là **phân quyền**.

### Các mảnh ghép trong dự án

| Mảnh ghép | Làm gì |
| --- | --- |
| Mật khẩu | Băm bằng `bcryptjs`, không bao giờ lưu hay trả ra dạng chữ thường |
| Cookie `session` | JWT HS256 (thư viện `jose`), ký bằng `SESSION_SECRET` (tối thiểu 32 ký tự) |
| Cookie flags | httpOnly, sameSite lax, secure khi production, sống 7 ngày, không có refresh token |
| Payload JWT | `{ userId, role }`, `role` là `OWNER` hoặc `STAFF` |
| `lib/session.ts` | Ký, đọc, xóa cookie |
| `lib/auth.ts` | `getCurrentUser`, `requireUser`, `requireOwner` |
| `proxy.ts` | Chặn `/admin/*`, `/me/*`, `/change-password` khi chưa có cookie |

### Hai lớp kiểm tra

```
Request ──► proxy.ts ──► Trang / Server Action ──► requireUser() / requireOwner()
            (có cookie       (kiểm quyền thật,        tra DB, chặn is_active = false,
             hay chưa?        nhanh nhưng nông)        kiểm role)
```

- **Lớp 1: `proxy.ts`** nhanh, chỉ xem có cookie hay chưa. Chưa có thì chuyển về `/login`.
- **Lớp 2: `requireUser()` / `requireOwner()`** là lớp quyết định. Mọi trang và mọi Server Action phải tự gọi, vì `proxy.ts` không đủ an toàn.
  - `requireUser()` cho mọi người đã đăng nhập (ví dụ `/me`, `changePassword`).
  - `requireOwner()` chỉ cho chủ quán (ví dụ `/admin/*`, `saveDayEntries`).
  - Hai hàm này tra DB, nên tài khoản vừa bị khóa sẽ bị chặn ngay dù cookie còn hạn.

### Trong code (mẫu theo `PROJECT-RULES.md`)

```ts
// NÊN: kiểm quyền rồi mới đọc dữ liệu, userId lấy từ phiên
const user = await requireUser();
const payroll = await getMyPayroll(user.id, month);

// KHÔNG NÊN: nhận userId từ client rồi tin luôn
export async function getPayroll(userId: number, month: string) { ... }
```

### Quy tắc phân quyền của dự án
- **OWNER:** truy cập `/admin/*`, quản lý nhân viên, mức lương, chấm công, thưởng phạt, bảng lương.
- **STAFF:** chỉ xem lương của chính mình ở `/me`, đổi mật khẩu của chính mình.
- Nhân viên **không bao giờ** nhận dữ liệu của người khác, kể cả trong dữ liệu truyền xuống client. Hàm `getMyPayroll` lấy `userId` từ phiên, không từ tham số.
- Khi không đủ điều kiện: chưa đăng nhập thì chuyển về `/login`; sai quyền thì chuyển về `/me`. Với Server Action thì trả lỗi `AUTH_002` (chưa đăng nhập) hoặc `AUTH_003` (không đủ quyền).

### Các mã lỗi liên quan

| Mã | Ý nghĩa |
| --- | --- |
| `AUTH_001` | Sai tên đăng nhập hoặc mật khẩu (cũng dùng khi tài khoản bị khóa, để không lộ thông tin) |
| `AUTH_002` | Chưa đăng nhập |
| `AUTH_003` | Không đủ quyền |
| `AUTH_004` | Mật khẩu cũ không đúng |

### Tại sao cần?
- Dữ liệu lương nhạy cảm, nhân viên chỉ được xem phần của mình.
- Mọi Server Action là một POST endpoint, ai cũng gửi được request kể cả khi không có nút trên giao diện. Vì vậy kiểm quyền phải nằm ở server, trong từng action.

### Không làm đúng thì sao?
- Chỉ ẩn nút "Admin" cho STAFF mà không gọi `requireOwner()`: nhân viên tự gửi request vẫn sửa được chấm công và lương.
- Chỉ dựa vào `proxy.ts`: tài khoản bị khóa vẫn vào được cho đến khi cookie hết hạn 7 ngày.
- Tin `userId` do client gửi: nhân viên đổi số này là xem được lương người khác.

### Điểm cần lưu ý
- Hiện **chưa có giới hạn số lần đăng nhập sai**.
- Không có refresh token. Hết 7 ngày thì đăng nhập lại.
- Thay đổi `SESSION_SECRET` sẽ làm mọi phiên hiện có mất hiệu lực.

### 📚 Tìm hiểu thêm
- Từ khóa: JWT, httpOnly cookie, bcrypt, authentication vs authorization, session cookie Next.js
- Tài liệu: `ARCHITECTURE.md` mục 5, `API_SPEC.md` mục 2 và 5, `PROJECT-RULES.md` mục 4 và 5
- Bài liên quan: [code/auth.md](../code/auth.md), [concept/server-action.md](server-action.md), [flow/server-action.md](../flow/server-action.md)

# Giải thích code: feature `auth`

- **Chế độ:** code
- **Target:** `src/features/auth`
- **Ngày viết:** 2026-11-12
- **Tài liệu đã đọc:** `src/features/auth/context.md`, `docs/ARCHITECTURE.md` (mục 3, 4, 5, 9), template `vi.md`
- **Lưu ý:** bài này viết từ tài liệu, không đọc source. Nếu code đổi thì bài có thể cũ.

## 📁 Feature: auth

### Mục đích
Lo việc đăng nhập, đăng xuất và đổi mật khẩu cho cả chủ quán (OWNER) và nhân viên (STAFF). Feature này làm việc với bảng `users`.

### Vị trí trong dự án
- Feature: `auth`
- Các tầng: Server Action, service, queries, schema, component, page

### Phân tích theo từng file

Feature này theo đúng "giải phẫu một feature" trong `ARCHITECTURE.md` mục 3: `actions.ts` gọi `service.ts`, `service.ts` gọi `queries.ts`, và `queries.ts` là nơi duy nhất nói chuyện với Prisma.

**`actions.ts` (Server Action, "quầy tiếp tân")**
- `login`: nhận tên đăng nhập và mật khẩu. Nếu đúng thì tạo cookie phiên, rồi chuyển hướng: OWNER sang `/admin`, STAFF sang `/me`. Nếu sai thì trả lỗi `AUTH_001`.
- `logout`: xóa cookie phiên.
- `changePassword`: đổi mật khẩu. Nếu mật khẩu cũ sai thì trả lỗi `AUTH_004`.

**`service.ts` (business logic, "người kiểm tra")**
- `verifyLogin`: so mật khẩu bằng bcrypt. Có hai chi tiết bảo mật:
  - Tài khoản bị khóa (`is_active = false`) được coi như đăng nhập sai, nên kẻ xấu không biết tài khoản đó có tồn tại hay không.
  - Khi tên đăng nhập không tồn tại, code vẫn so với một **hash giả**. Việc này làm thời gian phản hồi gần như nhau trong cả hai trường hợp, nên khó dò tên đăng nhập.
- `changeUserPassword`: kiểm tra mật khẩu cũ, rồi lưu hash mới.

**`queries.ts`**: chỉ truy cập bảng `users` bằng Prisma, không có logic nghiệp vụ.

**`schemas.ts` (Zod)**: kiểm tra dữ liệu đầu vào. Mật khẩu mới dài 6-72 ký tự (72 là giới hạn của bcrypt) và phải khác mật khẩu cũ.

**Component (export qua `index.ts`)**
- `LoginForm`: form đăng nhập ở `/login`.
- `ChangePasswordForm`: form đổi mật khẩu ở `/change-password`.
- `LogoutButton`: nút đăng xuất. Nút này và link đổi mật khẩu nằm ở `/admin` và `/me`.

### Ví dụ đời thường
Hãy nghĩ đến việc vào quán bằng thẻ nhân viên:
- `login` là bác bảo vệ ở cửa. Bác nhận thẻ rồi nhờ người trong quầy kiểm tra.
- `verifyLogin` là người kiểm tra thẻ. Thẻ hết hạn hay thẻ giả thì cũng chỉ trả lời "không hợp lệ", không nói rõ lý do.
- Cookie phiên là vòng đeo tay phát sau khi qua cửa. Vòng có hạn 7 ngày.
- `proxy.ts` là cửa quay ở lối vào. Cửa chỉ xem bạn có vòng tay hay chưa.
- `requireUser()` và `requireOwner()` là bảo vệ từng phòng. Họ tra sổ để chắc tài khoản chưa bị khóa, và phòng quản lý chỉ cho OWNER vào.

### Luồng đăng nhập

```
[/login] LoginForm
    │ bấm "Đăng nhập"
    ▼
[login - Server Action] validate bằng Zod
    │
    ▼
[verifyLogin - service] so bcrypt, tài khoản khóa = sai
    │
    ▼
[queries] lấy user từ bảng users (Prisma)
    │
    ▼
Sai  → trả { success:false, error: AUTH_001 }
Đúng → set cookie JWT 7 ngày, httpOnly
        ├─ OWNER → redirect /admin
        └─ STAFF → redirect /me
```

### 📏 Quy tắc dự án liên quan
- Chỉ `queries.ts` gọi Prisma. Action và service không gọi trực tiếp.
- Hai lớp kiểm tra quyền: `proxy.ts` chỉ xem có cookie hay chưa (nhanh). Quyền thật nằm ở `requireUser()` và `requireOwner()` trong từng trang và Server Action, có tra DB để chặn tài khoản đã khóa.
- Kết quả của Server Action có dạng `{ success, data }` hoặc `{ success:false, error }`.
- Các hàm ký, đọc, xóa cookie nằm ở `lib/session.ts`, còn `getCurrentUser`, `requireUser`, `requireOwner` nằm ở `lib/auth.ts`. Feature `auth` dùng chúng chứ không tự viết lại.

### 💡 Điểm cần nhớ
- Đăng nhập sai luôn trả cùng một lỗi `AUTH_001`, dù sai tên hay sai mật khẩu hay tài khoản bị khóa. Đây là chủ ý.
- Mật khẩu cũ sai khi đổi mật khẩu trả `AUTH_004`.
- **Chưa có giới hạn số lần đăng nhập sai.** Đây là điểm yếu đã biết, có thể cần bổ sung sau.
- Phiên là JWT lưu trong cookie httpOnly, hết hạn sau 7 ngày. JWT được ký bằng `SESSION_SECRET` (tối thiểu 32 ký tự).

### 🔗 Liên kết
- Được dùng bởi: các trang `/login`, `/change-password`, `/admin`, `/me`. Hàm `requireUser` và `requireOwner` ở `lib/auth.ts` được mọi feature dùng để kiểm quyền.
- Gọi tới: `lib/session.ts`, `lib/prisma.ts` (qua `queries.ts`), thư viện bcrypt và Zod.
- Tài liệu: `ARCHITECTURE.md` mục 3 (giải phẫu feature) và mục 5 (xác thực, phân quyền), `API_SPEC.md` (mục auth và mã lỗi), `SPEC.md` mục 6.

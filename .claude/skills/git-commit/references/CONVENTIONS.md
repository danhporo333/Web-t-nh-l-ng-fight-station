# Quy ước commit của web tính lương Fight Station

Đặt file này ở `.claude/skills/git-commit/references/conventions.md`.

Repo là **một ứng dụng Next.js** (Next.js 16 + Prisma + MySQL), tài liệu ở `docs/`, code ở `src/`, schema ở `prisma/`.

**Toàn bộ commit message viết bằng tiếng Việt có dấu**, kể cả loại commit. Chỉ giữ nguyên các tên riêng trong code: tên feature/thư mục (`rates`, `payroll`), tên file, tên hàm, tên thư viện (`Prisma`, `Next.js`, `Vercel`).

## Định dạng

```
<loại>(<phạm vi>): <mô tả ngắn>

<nội dung>

<chân trang>
```

- `loại`: chọn từ bảng bên dưới, viết thường.
- `phạm vi`: tên feature hoặc khu vực code, viết thường (xem mục "Nhận diện phạm vi").
- `mô tả ngắn`, `nội dung`, `chân trang`: tiếng Việt có dấu.

## Các loại commit

| Loại | Khi nào dùng | Ví dụ thay đổi |
|------|--------------|----------------|
| `tính năng` | Tính năng mới | Thêm trang, Server Action, bảng hoặc cột Prisma mới |
| `sửa lỗi` | Sửa lỗi | Sửa tính sai lương, sửa logic sai, xử lý trường hợp biên |
| `tái cấu trúc` | Sắp xếp lại code, không đổi hành vi | Đổi tên, tách hàm, chuyển file |
| `tài liệu` | Tài liệu | `README.md`, `context.md`, `CLAUDE.md`, `docs/*` |
| `định dạng` | Định dạng, không đổi code | Prettier, sửa lỗi ESLint, khoảng trắng |
| `kiểm thử` | Thêm hoặc sửa test | File `*.test.ts` (Vitest) |
| `bảo trì` | Việc lặt vặt, bảo trì | Thư viện, script, `.env.example`, skill trong `.claude/` |
| `hiệu năng` | Cải thiện hiệu năng | Giảm số truy vấn Prisma, thêm index |
| `đóng gói` | Build và triển khai | `next.config.ts`, `tsconfig.json`, `vercel.json` |
| `hoàn tác` | Hoàn tác commit | Hoàn tác một commit trước đó |

## Tự nhận diện loại

| File hoặc nội dung thay đổi | Loại |
|-----------------------------|------|
| Chỉ có `*.test.ts` | `kiểm thử` |
| Chỉ có `*.md` (`README.md`, `context.md`, `CLAUDE.md`, `docs/`) | `tài liệu` |
| Chỉ có `package.json`, `package-lock.json`, `eslint.config.mjs`, `.env.example` | `bảo trì` |
| Chỉ có `.claude/` (skill, settings) | `bảo trì` |
| `next.config.ts`, `tsconfig.json`, `vercel.json` | `đóng gói` |
| Thêm bảng hoặc cột trong `prisma/schema.prisma` | `tính năng` |
| File mới và export mới trong `src/features/` (trang, action, component) | `tính năng` |
| Sửa logic có sẵn, xử lý lỗi, sửa công thức lương | `sửa lỗi` |
| Đổi tên, di chuyển file, không đổi logic | `tái cấu trúc` |

Bỏ qua thư mục sinh tự động khi nhận diện: `.next/`, `node_modules/`. Nếu chúng bị stage thì cảnh báo người dùng.

## Nhận diện phạm vi

| Đường dẫn file | Phạm vi |
|----------------|---------|
| `src/features/<tên>/*` | `<tên>` (ví dụ `rates`, `payroll`) |
| `src/app/<route>/*` thuộc một feature | `<tên>` của feature đó |
| `proxy.ts` | `auth` |
| `prisma/*` đi kèm một feature | `<tên>` của feature đó |
| `prisma/*` đứng riêng | `csdl` |
| `src/lib/*` | `lib` |
| `src/shared/*` | `shared` |
| `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css` | `app` |
| `docs/API_SPEC.md` | `api` |
| `docs/DATABASE..md` | `csdl` |
| `docs/SPEC.md`, `docs/PROJECT-RULES.md`, `docs/ARCHITECTURE.md`, `docs/SETUP-NOTES.md` | bỏ phạm vi |
| `.claude/*` | `claude` |
| Cấu hình gốc (`package.json`, `next.config.ts`, ...) | bỏ phạm vi |
| Nhiều feature không liên quan | bỏ phạm vi, hoặc gợi ý tách commit |

Các feature hiện có: `auth`, `staff`, `shifts`, `rates`, `attendance`, `adjustments`, `payroll`, `me`.

## Quy tắc mô tả ngắn

- Bắt đầu bằng động từ: "thêm", "sửa", "xóa", "cập nhật", "tách", "đổi tên", "chép"…
- Viết thường chữ cái đầu (trừ tên riêng như `README`, `Prisma`, `Vercel`).
- Không chấm câu ở cuối.
- Tối đa 72 ký tự tính cả `loại(phạm vi): `.
- Đọc liền thành câu: "Commit này sẽ… <mô tả ngắn>".

## Quy tắc nội dung

- Cách dòng mô tả ngắn một dòng trống.
- Xuống dòng ở khoảng 72 ký tự.
- Giải thích **làm gì** và **tại sao**, không cần giải thích **làm thế nào**.
- Nhiều thay đổi thì dùng gạch đầu dòng.
- Với thay đổi liên quan tính lương: ghi rõ quy tắc nghiệp vụ bị ảnh hưởng (ví dụ "ca chiều tính vào ngày bắt đầu ca").

## Chân trang

- Liên kết issue: `Liên quan: #12`.
- Thay đổi phá vỡ tương thích: thêm `!` sau phạm vi và dòng `PHÁ VỠ TƯƠNG THÍCH: <giải thích>`.

## Ví dụ

### Tính năng đơn giản
```
tính năng(rates): chép mức lương từ tháng trước
```

### Tính năng có nội dung
```
tính năng(staff): thêm ô lương mặc định mọi ca

- Thêm cột users.default_rate (có thể trống)
- Form tạo và sửa nhân viên nhận defaultRate
- Tháng đầu tiên lấy mức này cho cả hai ca
```

### Sửa lỗi
```
sửa lỗi(payroll): tính thưởng phạt đúng tháng

Khoản ghi ngày cuối tháng bị tính sang tháng sau vì so sánh
ngày theo giờ địa phương. Đổi sang khoảng [đầu tháng, đầu
tháng sau) theo giờ UTC.

Liên quan: #7
```

### Kiểm thử
```
kiểm thử(payroll): thêm test tính lương hai ca trong ngày
```

### Tài liệu
```
tài liệu: cập nhật quy tắc lương mặc định theo nhân viên
```

### Thay đổi phá vỡ tương thích
```
tái cấu trúc(csdl)!: đổi tên cột morning_rate thành rate_morning

PHÁ VỠ TƯƠNG THÍCH: cần chạy lại npm run db:push và cập nhật
mọi truy vấn dùng cột cũ.
```

### Thay đổi chung
```
tái cấu trúc(shared): gom hàm định dạng tiền vào shared/utils

- Chuyển formatMoney sang shared/utils
- Cập nhật import ở rates, payroll, me
```

### Nhiều phạm vi (hạn chế dùng)
```
bảo trì: cập nhật thư viện

- Nâng Prisma lên bản mới
- Nâng Next.js lên bản mới
```

## Không được commit

- `.env`, `.env.local` hoặc bất kỳ file chứa mật khẩu, chuỗi kết nối, `SESSION_SECRET` thật. Chỉ `.env.example` được commit.
- `node_modules/`, `.next/`.
- File dữ liệu thật của nhân viên (lương, mật khẩu).

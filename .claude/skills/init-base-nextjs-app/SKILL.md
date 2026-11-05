---
name: "init-base-nextjs-app"
description: "Dựng cấu trúc thư mục, thư viện và file cấu hình cho web tính lương Fight Station (Next.js + Prisma + MySQL, một app, feature-based). Không viết code chức năng. Dùng khi nói init base hoặc setup dự án."
---

# Khởi tạo nền dự án web tính lương

**Phạm vi:** cấu trúc + thư viện + file cấu hình + module lõi dùng chung + ghi lại `SETUP-NOTES.md`. KHÔNG viết code chức năng nghiệp vụ.

Dự án là **một ứng dụng Next.js duy nhất** (không tách BE/FE). Skill này khác với `init-base` của dự án NestJS/React: không có `backend-nest-hoidanit/` hay `frontend-react-hoidanit/`.

Skill này làm:
- Cấu trúc thư mục theo feature, đúng với `ARCHITECTURE.md`.
- Cài thư viện còn thiếu.
- File cấu hình: `.env.example`, `.gitignore`, scripts trong `package.json`, `tsconfig`.
- Module lõi: Prisma client, phiên đăng nhập, kiểm tra quyền, kiểu kết quả Server Action, proxy.
- Schema Prisma và seed.
- Ghi `SETUP-NOTES.md`: đã setup những gì và các lệnh hay dùng.

Skill này KHÔNG làm:
- Trang hay action của nhân viên, lương, chấm công, thưởng phạt, bảng lương (làm ở bước 3 và 4).
- Đưa lên GitHub hoặc Vercel.

## Kiểm tra trước khi chạy

1. Thư mục hiện tại có `package.json` không. Nếu không: báo "Chưa có dự án. Hãy tạo bằng create-next-app trước." và dừng.
2. Đọc `package.json` để biết thư viện nào đã có.
3. Có đủ năm file tài liệu dưới đây không (thường ở thư mục gốc hoặc `docs/`). Thiếu file nào thì liệt kê, hỏi người dùng và dừng.

## Tài liệu cần đọc trước (đọc hết trước khi làm)

| File | Dùng để |
| --- | --- |
| `SPEC.md` | Quy tắc lương, màn hình, phân quyền |
| `DATABASE..md` | Bảng, cột, ràng buộc |
| `PROJECT-RULES.md` | Quy ước đặt tên, cấu trúc feature, pattern bắt buộc, anti-pattern |
| `ARCHITECTURE.md` | Cấu trúc thư mục, giải phẫu một feature, luồng request, route, cấu hình |
| `API_SPEC.md` | Định dạng kết quả Server Action, mã lỗi, danh sách hàm theo feature |
| `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` | Cách viết `proxy.ts` ở Next.js 16 |
| `node_modules/next/dist/docs/01-app/02-guides/authentication.md` | Mẫu đăng nhập và cookie |

Next.js 16 khác các bản cũ. Luôn đọc tài liệu trong `node_modules/next/dist/docs/` trước khi viết code.

**Thứ tự ưu tiên khi các tài liệu khác nhau:** `ARCHITECTURE.md` quyết định cấu trúc thư mục, `PROJECT-RULES.md` quyết định đặt tên và pattern, `DATABASE..md` quyết định schema, `API_SPEC.md` quyết định định dạng kết quả và mã lỗi. Mục cấu trúc bên dưới chỉ là bản tóm tắt. Nếu lệch với tài liệu, làm theo tài liệu và báo cho người dùng.

## Quy trình

1. Đọc năm tài liệu và tài liệu Next.js ở trên.
2. Quét dự án: file nào đã có, thư viện nào đã cài.
3. **Liệt kê thư viện sẽ cài và hỏi người dùng xác nhận.**
4. Cài thư viện còn thiếu.
5. Tạo cấu trúc thư mục theo `ARCHITECTURE.md` (mục bên dưới).
6. Tạo file cấu hình.
7. Tạo module lõi.
8. Kiểm tra (mục Kiểm tra).
9. Ghi `SETUP-NOTES.md` (mục Ghi SETUP-NOTES.md), sau khi kiểm tra xong để ghi đúng kết quả thật.
10. Báo cáo kết quả.

### Thư viện

Chỉ cài thứ còn thiếu:

```bash
npm i @prisma/client@6 bcryptjs jose server-only zod
npm i -D prisma@6 tsx vitest
```

`bcryptjs` v3 đã có kiểu dữ liệu, không cần `@types/bcryptjs`. `zod` dùng để validate dữ liệu vào của Server Action, `vitest` dùng cho test, theo `PROJECT-RULES.md`.

### Cấu trúc thư mục

Bản tóm tắt, cấu trúc đầy đủ nằm ở `ARCHITECTURE.md`:

```
prisma/
  schema.prisma          # 5 bảng: users, shifts, monthly_rates, work_entries, adjustments
  seed.ts                # ca mặc định + tài khoản chủ quán
proxy.ts                 # chặn trang khi chưa có cookie session (ở thư mục gốc)
src/
  app/                   # chỉ route và layout, mỏng
    layout.tsx
    page.tsx             # chuyển hướng theo vai trò
    login/
    admin/               # khung cho chủ quán
    me/                  # khung cho nhân viên
  features/              # code theo nghiệp vụ, mỗi thư mục là một feature
    auth/
    staff/
    shifts/
    rates/
    attendance/
    adjustments/
    payroll/
    me/
  lib/                   # module lõi dùng chung
    prisma.ts
    session.ts
    auth.ts
    result.ts
  shared/                # thành phần giao diện và hàm dùng chung
    components/
    utils/
```

Mỗi thư mục trong `features/` tạo hai file mỏng: `index.ts` (chỉ có comment, là nơi feature export ra ngoài) và `context.md` (5–10 dòng: feature làm gì, dùng bảng nào, lấy từ `SPEC.md` và `DATABASE..md`). Không tạo `actions.ts`, `service.ts`, `queries.ts` hay component; những file đó viết ở bước 3 và 4 theo `PROJECT-RULES.md`.

### File cấu hình

**`.env.example`**

```
DATABASE_URL="mysql://root:matkhau@localhost:3306/fight_station"
SESSION_SECRET="chuoi-ngau-nhien-it-nhat-32-ky-tu"
OWNER_USERNAME="chuquan"
OWNER_PASSWORD="doimatkhau123"
```

**`.gitignore`**: sau dòng `.env*` thêm `!.env.example`.

**`package.json`**: thêm scripts (giữ các script cũ):

```json
"postinstall": "prisma generate",
"build": "prisma generate && next build",
"db:push": "prisma db push",
"db:seed": "tsx prisma/seed.ts",
"db:studio": "prisma studio",
"test": "vitest run"
```

**`next.config.ts`**: không bật `cacheComponents` hay `partialPrefetching`. Bật lên sẽ làm build lỗi ở các trang đọc cookie.

### Module lõi

- **`src/lib/prisma.ts`**: singleton `PrismaClient`, lưu vào `globalThis` khi không ở production.
- **`src/lib/session.ts`**: `import "server-only"`. Ký và kiểm tra JWT HS256 bằng `SESSION_SECRET` (báo lỗi nếu dưới 32 ký tự). Cookie `session`: httpOnly, sameSite lax, secure khi production, hết hạn sau 7 ngày. Dùng `await cookies()`.
- **`src/lib/auth.ts`**: `getCurrentUser` (bọc bằng `cache` của React, tra DB để chặn user `isActive = false`), `requireUser` (chuyển về `/login`), `requireOwner` (STAFF chuyển về `/me`).
- **`src/lib/result.ts`**: kiểu `ActionResult<T>` và hai hàm `ok(data)`, `fail(code, message, details?)`, theo định dạng trong `API_SPEC.md` (`{ success: true, data }` hoặc `{ success: false, error: { code, message, details } }`).
- **`proxy.ts`**: chỉ kiểm tra có cookie `session` không, matcher `/admin/:path*`, `/me/:path*` và `/change-password`. Quyền thật sự nằm trong `auth.ts`.

Không ghi đè file đã có. Nếu `layout.tsx` hay `page.tsx` đã có nội dung của Next mặc định, chỉ sửa các phần cần thiết (`lang="vi"`, title, description) và báo lại.

### Schema và seed

- **`prisma/schema.prisma`** theo `DATABASE..md`. Các enum: `Role` (OWNER, STAFF), `ShiftCode` (MORNING, AFTERNOON), `AdjustmentType` (BONUS, PENALTY). Dùng `@map` để tên cột trong DB là snake_case.
- **`prisma/seed.ts`**: upsert hai ca (sáng 07:30–16:00, 8.5 giờ, 24000đ; chiều 16:00–02:00, 10 giờ, 26000đ). Tạo tài khoản OWNER từ `OWNER_USERNAME` và `OWNER_PASSWORD` nếu chưa có. Băm mật khẩu bằng `bcrypt.hash(password, 10)`.

## Kiểm tra

Dùng biến giả để build, không cần MySQL thật:

```bash
DATABASE_URL=mysql://a:b@localhost:3306/x SESSION_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
npx prisma validate
npx prisma generate
npx tsc --noEmit
npm run lint
npm run build
```

`npm run build` phải liệt kê `/`, `/admin`, `/login`, `/me` là dynamic (ƒ). Nếu lỗi "uncached or runtime data during prerendering", kiểm tra lại `next.config.ts`.

Khi có MySQL thật, theo thứ tự: `npm run db:push`, `npm run db:seed`, `npm run dev`, đăng nhập bằng tài khoản chủ quán.

## Ghi SETUP-NOTES.md

Sau khi kiểm tra xong, ghi file `SETUP-NOTES.md` để người sau (và Claude ở phiên sau) biết đã setup những gì và dùng lệnh nào. File là bản ghi lại kết quả thật của lần chạy này, không phải bản sao của skill.

**Vị trí:** cùng thư mục với nhóm tài liệu (`docs/SETUP-NOTES.md`; nếu tài liệu nằm ở thư mục gốc thì đặt ở thư mục gốc).

**Nếu file đã có:** không ghi đè. Thêm một mục mới ở cuối file với tiêu đề `## Cập nhật <ngày YYYY-MM-DD>`, chỉ ghi phần thay đổi.

**Nội dung** (ngắn gọn, dùng bảng và gạch đầu dòng, tối đa khoảng 80 dòng):

```markdown
# SETUP-NOTES

Ghi lại những gì đã setup cho web tính lương Fight Station. Ngày: <YYYY-MM-DD>.

## Môi trường
- Node <phiên bản>, npm <phiên bản>
- Next.js <phiên bản>, Prisma <phiên bản>, MySQL (chưa kết nối / đã kết nối)

## Đã cài
| Thư viện | Phiên bản | Dùng để |
| --- | --- | --- |
| ... | ... | ... |

## Đã tạo
- Cấu trúc: <danh sách thư mục và file chính>
- Module lõi: prisma, session, auth, result, proxy
- Schema: <số bảng>, seed: <nội dung>
- Cấu hình: `.env.example`, `.gitignore`, scripts trong `package.json`

## Đã sửa file có sẵn
- `next.config.ts`: <đã xóa gì>
- `layout.tsx`, `page.tsx`: <đã sửa gì>

## Bỏ qua (đã có)
- <danh sách, hoặc "không có">

## Kết quả kiểm tra
| Lệnh | Kết quả |
| --- | --- |
| `npx prisma validate` | <đạt / lỗi> |
| `npx tsc --noEmit` | <đạt / lỗi> |
| `npm run lint` | <đạt / lỗi> |
| `npm run build` | <đạt / lỗi> |

## Lệnh hay dùng
| Lệnh | Dùng để |
| --- | --- |
| `npm run dev` | Chạy thử tại http://localhost:3000 |
| `npm run build` | Kiểm tra trước khi đưa lên Vercel |
| `npm run lint` | Kiểm tra style |
| `npm test` | Chạy test (Vitest) |
| `npm run db:push` | Tạo bảng trong MySQL theo schema |
| `npm run db:seed` | Tạo hai ca mặc định và tài khoản chủ quán |
| `npm run db:studio` | Mở Prisma Studio xem dữ liệu |

## Lưu ý
- `next.config.ts` không được bật `cacheComponents` hay `partialPrefetching`.
- Next.js 16 dùng `proxy.ts`, không dùng `middleware.ts`.
- <lưu ý riêng phát sinh trong lần chạy này, ví dụ tài liệu lệch nhau và đã xử lý thế nào>

## Bước tiếp theo
1. `cp .env.example .env` rồi điền giá trị thật
2. `npm run db:push`, rồi `npm run db:seed`
3. `npm run dev`, đăng nhập bằng tài khoản chủ quán
4. Làm chức năng theo `SPEC.md` (bước 3 và 4)
```

Quy tắc khi ghi:
- Chỉ ghi những gì đã thực sự xảy ra. Lệnh kiểm tra nào chưa chạy hoặc lỗi thì ghi đúng như vậy, không ghi "đạt".
- Lấy phiên bản từ `package.json` và `node -v`, không đoán.
- Không ghi mật khẩu, chuỗi kết nối hay `SESSION_SECRET` thật vào file.

## Checklist

- [ ] Đã đọc đủ năm tài liệu và tài liệu Next.js
- [ ] Cấu trúc thư mục khớp `ARCHITECTURE.md`
- [ ] Tên file và thư mục theo `PROJECT-RULES.md` (kebab-case, feature số ít)
- [ ] Thư viện đã cài, người dùng đã xác nhận
- [ ] `.env.example` có đủ 4 biến
- [ ] `.gitignore` cho phép `.env.example`
- [ ] `cacheComponents` không bật
- [ ] `src/lib/result.ts` khớp định dạng trong `API_SPEC.md`
- [ ] `prisma validate` và `tsc --noEmit` không lỗi
- [ ] `npm run lint` không lỗi
- [ ] `npm run build` thành công
- [ ] `SETUP-NOTES.md` đã ghi, kết quả kiểm tra đúng với thực tế

## Báo cáo

```
✅ Khởi tạo nền dự án web tính lương xong.

📚 Đã đọc: SPEC.md, DATABASE..md, PROJECT-RULES.md, ARCHITECTURE.md, API_SPEC.md

📦 Thư viện đã cài:
- [danh sách]

📂 Cấu trúc đã tạo:
- src/features/ (index.ts và context.md, sẵn sàng cho chức năng)
- src/lib/ (prisma, session, auth, result)
- prisma/ (schema, seed)
- [khác]

⚙️ File cấu hình:
- .env.example
- [khác]

📝 Ghi lại: docs/SETUP-NOTES.md

⚠️ Bỏ qua (đã có):
- [danh sách]

⚠️ Lệch giữa skill và tài liệu (nếu có):
- [danh sách, đã làm theo tài liệu]

🚀 Bước tiếp theo:
1. cp .env.example .env rồi điền giá trị thật
2. npm run db:push
3. npm run db:seed
4. npm run dev
```

## Quy tắc quan trọng

1. Không xóa, không ghi đè file đã có.
2. Hỏi trước khi sửa file đã có (ví dụ `layout.tsx`, `next.config.ts`).
3. Báo rõ file nào đã bỏ qua.
4. Không ghi mật khẩu thật hoặc `.env` thật vào file đã tạo.
5. Không tạo code nghiệp vụ.
6. `SETUP-NOTES.md` chỉ ghi sự thật; không ghi "đạt" cho lệnh chưa chạy.

## Xử lý lỗi

| Lỗi | Xử lý |
| --- | --- |
| Không có `package.json` | Báo "Chưa có dự án" và dừng |
| Thiếu một trong năm tài liệu | Liệt kê file thiếu, hỏi người dùng |
| Tài liệu mâu thuẫn nhau | Làm theo thứ tự ưu tiên trong mục Đọc trước, báo người dùng |
| `npm run build` lỗi prerender | Kiểm tra `cacheComponents` trong `next.config.ts` |
| `SESSION_SECRET` dưới 32 ký tự | Báo người dùng đặt lại trong `.env` |
| `SETUP-NOTES.md` đã có | Không ghi đè, thêm mục `## Cập nhật <ngày>` ở cuối file |
# SETUP-NOTES

Ghi lại những gì đã setup cho web tính lương Fight Station. Ngày: 2026-11-05.

## Môi trường
- Node v24.14.0, npm 11.9.0
- Next.js 16.4.5, React 19.3.0, Prisma 6.19.3, MySQL (chưa kết nối)

## Đã cài
| Thư viện | Phiên bản | Dùng để |
| --- | --- | --- |
| @prisma/client | ^6.19.3 | Truy cập MySQL |
| prisma (dev) | ^6.19.3 | Schema, generate, db push |
| bcryptjs | ^3.0.3 | Băm mật khẩu |
| jose | ^6.2.15 | Ký và kiểm tra JWT phiên đăng nhập |
| server-only | ^0.0.1 | Chặn code server lọt ra trình duyệt |
| zod | ^4.6.7 | Validate dữ liệu vào Server Action |
| tsx (dev) | ^4.23.15 | Chạy `prisma/seed.ts` |
| vitest (dev) | ^5.1.0 | Test |
| @types/node (dev) | ^22.20.5 | Nâng từ ^20 vì vitest 5.1 yêu cầu từ bản 22 |

## Đã tạo
- Cấu trúc: `prisma/`, `proxy.ts`, `src/lib/`, `src/shared/{components,utils}/`, `src/features/{auth,staff,shifts,rates,attendance,adjustments,payroll,me}/` (mỗi feature có `index.ts` và `context.md`), `src/app/{login,admin,me}/page.tsx`
- Module lõi: prisma, session, auth, result, proxy
- Schema: 5 bảng (users, shifts, monthly_rates, work_entries, adjustments), 3 enum. Seed: hai ca mặc định và tài khoản chủ quán
- Cấu hình: `.env.example`, `.gitignore`, scripts trong `package.json`

## Đã sửa file có sẵn
- `next.config.ts`: xóa `cacheComponents` và `partialPrefetching`
- `src/app/layout.tsx`: `lang="vi"`, đổi title và description
- `src/app/page.tsx`: thay trang mẫu bằng chuyển hướng theo vai trò
- `.gitignore`: thêm `!.env.example`
- `package.json`: thêm scripts, nâng `@types/node`

## Bỏ qua (đã có)
- Không có

## Kết quả kiểm tra
| Lệnh | Kết quả |
| --- | --- |
| `npx prisma validate` | đạt |
| `npx tsc --noEmit` | đạt |
| `npm run lint` | đạt |
| `npm run build` | đạt (`/`, `/admin`, `/login`, `/me` là dynamic) |
| `npm test` | chưa chạy, chưa có test |
| `db:push`, `db:seed` | chưa chạy, chưa có MySQL thật |

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
- `ARCHITECTURE.md` ghi "tạo thư mục khi dùng đến" nhưng skill yêu cầu tạo sẵn thư mục `features/*`; đã làm theo skill, chỉ có `index.ts` và `context.md`.
- Trang `/change-password` đã làm trong feature auth.
- Trang `/login` đã có form (feature auth).

## Bước tiếp theo
1. `cp .env.example .env` rồi điền giá trị thật
2. `npm run db:push`, rồi `npm run db:seed`
3. `npm run dev`, đăng nhập bằng tài khoản chủ quán
4. Làm chức năng theo `SPEC.md` (bước 3 và 4)

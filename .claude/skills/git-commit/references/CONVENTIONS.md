# Quy ước Commit - Web tính lương Fight Station

## Định dạng

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Loại Commit (type)

| Loại | Khi nào dùng | Ví dụ thay đổi |
|------|------------|----------------|
| `feat` | Tính năng mới | Thêm quản lý nhân viên, bảng lương, chấm công |
| `fix` | Sửa lỗi | Sửa tính lương, sửa logic đăng nhập, xử lý trường hợp đặc biệt |
| `refactor` | Tái cấu trúc (không đổi hành vi) | Sắp xếp lại queries, tách hàm, đổi tên |
| `docs` | Tài liệu | SPEC.md, context.md, comment, docs feature |
| `style` | Định dạng (không đổi code) | Prettier, eslint fixes, khoảng trắng |
| `test` | Thêm/cập nhật test | Các file test, vitest specs |
| `chore` | Bảo trì | Dependencies, configs, scripts |
| `perf` | Tối ưu hiệu suất | Tối ưu queries, giảm payload |
| `ci` | CI/CD | GitHub Actions, Vercel config |
| `build` | Hệ thống build | tsconfig, next.config.ts, setup Prisma |
| `seed` | Seed database | seed.ts, dữ liệu ban đầu |
| `revert` | Hoàn tác commit | Undo commit trước |

## Tự động phát hiện loại commit

| File/nội dung thay đổi | Loại phát hiện |
|-----------------------|----------------|
| `*.spec.ts`, `*.test.ts` chỉ | `test` |
| `docs/*.md` hoặc `**/context.md` chỉ | `docs` |
| `package.json`, `tsconfig.json`, `next.config.ts` chỉ | `chore` |
| `prisma/schema.prisma`, `prisma/seed.ts` | `build` hoặc `seed` |
| `.github/workflows/*` | `ci` |
| File feature mới (actions.ts, service.ts, v.v.) | `feat` |
| Sửa lỗi logic hiện tại, error handling | `fix` |
| Đổi tên, di chuyển file, không thay logic | `refactor` |

## Phát hiện Scope

Các feature trong dự án: `auth`, `staff`, `shifts`, `rates`, `attendance`, `adjustments`, `payroll`, `me`

| Đường dẫn file | Scope |
|-----------|-------|
| `src/features/auth/*` | `auth` |
| `src/features/staff/*` | `staff` |
| `src/features/shifts/*` | `shifts` |
| `src/features/rates/*` | `rates` |
| `src/features/attendance/*` | `attendance` |
| `src/features/adjustments/*` | `adjustments` |
| `src/features/payroll/*` | `payroll` |
| `src/features/me/*` | `me` |
| `src/lib/*`, `src/shared/*` | `shared` |
| `src/app/*` | không ghi scope |
| Nhiều feature | không ghi scope hoặc dùng `core` |

## Quy tắc tiêu đề (subject)

- Động từ bắt đầu: "add" không phải "adds" hay "added"
- Chữ thường ở đầu
- Không dấu chấm ở cuối
- Tối đa 50 ký tự
- Hoàn thành câu: "Commit này sẽ..."

## Quy tắc phần body

- Cách tiêu đề bằng một dòng trống
- Gấp lại ở 72 ký tự
- Giải thích CÁI GÌ và TẠI SAO, không phải CÁCH THẾ NÀO
- Dùng bullet points cho nhiều thay đổi
- Tham chiếu yêu cầu từ SPEC.md nếu liên quan

## Ví dụ

### Tính năng đơn giản
```
feat(staff): thêm trang quản lý nhân viên

- Tạo danh sách nhân viên (tạo/sửa/xóa)
- Thêm chức năng đặt lại mật khẩu
- Bật/tắt trạng thái hoạt động của nhân viên
```

### Sửa tính lương
```
fix(payroll): sửa tính lương cho nhân viên làm nửa ngày

Giờ không được làm tròn đúng, gây ra
chênh lệch tiền trong các batch lớn.

Sửa theo quy tắc SPEC.md phần 3.
```

### Chấm công theo ngày
```
feat(attendance): triển khai chấm công từng ngày

- Thêm schema bảng work_entries
- Tạo form chấm công với lựa chọn ca
- Tự điền giờ mặc định theo ca
- Cho phép đánh dấu ngày Off
```

### Chép lương khi sang tháng mới
```
feat(rates): tự chép lương khi sang tháng mới

- Chép lương tháng trước cho tất cả nhân viên
- Fallback đến default_rate nếu chưa có
- Fallback đến shift default_rate nếu cần
```

### Nhiều feature (tránh nếu có thể)
```
refactor: sắp xếp export và import của feature

- Thêm index.ts cho mỗi feature
- Di chuyển kiểm tra auth chung vào lib/auth.ts
- Cập nhật import trên toàn dự án
```

### Breaking change
```
feat(payroll)!: đổi tính lương sang dùng Decimal

BREAKING CHANGE: Tất cả số tiền giờ dùng
Decimal(10,2) thay vì Int. Cần migration.
```

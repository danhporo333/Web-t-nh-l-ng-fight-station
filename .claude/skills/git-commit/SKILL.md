---
name: git-commit
description: >
  Viết conventional commit messages cho ứng dụng tính lương Fight Station.
  Dùng khi user nói "commit", "save changes", "tạo commit", hoặc hoàn thành task.
argument-hint: "[type] [scope] [message]"
allowed-tools:
  - Bash
  - Read
---

# Commit Helper cho Fight Station

Viết commit rõ ràng, theo quy tắc dự án.

## Cách dùng

```
/commit                               → Tự phát hiện type từ các thay đổi
/commit feat staff thêm quản lý nhân viên     → Nhanh: type + scope + message
/commit fix payroll sửa tính lương → Sửa lỗi cụ thể
/commit --amend                       → Sửa commit cuối
```

## Ví dụ nhanh cho dự án này

```
/commit feat staff thêm trang quản lý nhân viên
    ↓ thành:
feat(staff): thêm trang quản lý nhân viên

- Tạo danh sách nhân viên (tạo/sửa/xóa)
- Thêm chức năng đặt lại mật khẩu
- Bật/tắt trạng thái hoạt động

/commit fix attendance sửa tính giờ
/commit feat rates tự chép lương khi sang tháng mới
/commit feat payroll thêm bảng tóm tắt lương hàng tháng
/commit docs cập nhật SPEC cho feature thưởng phạt
```

## Luồng công việc

1. **Kiểm tra staged changes**:
   ```bash
   git diff --staged --stat
   ```
   - Nếu chưa stage → gợi ý `git add <files>` trước

2. **Đọc quy ước dự án**: `docs/CONVENTIONS.md`

3. **Phân tích thay đổi**:
   ```bash
   git diff --staged
   ```

4. **Phát hiện scope từ feature**:
   - `src/features/auth/` → `(auth)`
   - `src/features/staff/` → `(staff)`
   - `src/features/payroll/` → `(payroll)`
   - v.v.

5. **Phát hiện type** từ file thay đổi:
   - File feature mới → `feat`
   - Lỗi logic hiện tại → `fix`
   - Đổi tên/sắp xếp → `refactor`
   - Chỉ `docs/*.md` hoặc `context.md` → `docs`

6. **Tạo message** → hiển thị xem trước:

   ```
   📝 XEM TRƯỚC COMMIT
   
   feat(staff): thêm trang quản lý nhân viên
   
   - Tạo danh sách nhân viên (tạo/sửa/xóa)
   - Thêm chức năng đặt lại mật khẩu
   - Bật/tắt trạng thái hoạt động
   
   Staged files (4):
     A src/features/staff/actions.ts
     A src/features/staff/components/staff-list.tsx
     A src/features/staff/service.ts
     A src/features/staff/queries.ts
   
   Tạo commit? (có/không/sửa)
   ```

7. **Thực thi sau khi xác nhận**:
   - `có` → commit với attribution cho Claude Haiku 4.5
   - `sửa` → user sửa message, rồi commit
   - `không` → hủy

## Trường hợp đặc biệt

### Setup database
```
/commit build setup Prisma schema
    → (áp dụng cho schema.prisma)

/commit seed khởi tạo dữ liệu mặc định
    → (áp dụng cho prisma/seed.ts)
```

### Tính lương
Luôn tham chiếu SPEC.md phần 3:
```
/commit fix payroll sửa làm tròn giờ thập phân
```

### Context.md của feature
Cập nhật context.md khi feature thay đổi:
```
/commit docs cập nhật tài liệu feature staff
```

## Quy tắc

- **Features**: `auth`, `staff`, `shifts`, `rates`, `attendance`, `adjustments`, `payroll`, `me`
- **Scope từ đường dẫn**: `src/features/attendance/` → `(attendance)`
- **Chữ thường**: Type và scope luôn chữ thường
- **Không dấu chấm**: Không có dấu `.` ở cuối subject
- **Động từ bắt đầu**: "add" không phải "added", "fix" không phải "fixed"
- **Tham chiếu SPEC.md**: Khi sửa tính toán hoặc logic nghiệp vụ
- **Quy tắc 50/72**: Subject ≤50 ký tự, body gấp ở 72
- **Không nhạy cảm**: Không bao gồm mật khẩu, hash, secret

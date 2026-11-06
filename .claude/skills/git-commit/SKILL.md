---
name: "git-commit"
description: "Viết commit message hoàn toàn bằng tiếng Việt (loại, mô tả, nội dung) cho web tính lương Fight Station. Dùng khi nói commit, tạo commit, viết commit message, lưu thay đổi."
---

# Tạo commit message

Skill cho dự án web tính lương Fight Station (một ứng dụng Next.js + Prisma + MySQL). Quy ước chi tiết nằm ở `./references/conventions.md`. Nếu không thấy file này, dùng mục Git workflow trong `docs/PROJECT-RULES.md` và báo người dùng thiếu file.

## Cách dùng

```
/git-commit                                → Tự nhận diện loại từ thay đổi
/git-commit tính năng thêm ô lương mặc định → Commit nhanh với loại + mô tả
/git-commit --amend                        → Sửa message của commit gần nhất
```

## Quy trình

1. **Kiểm tra thay đổi đã stage**:
   ```bash
   git diff --staged --stat
   ```
   - Nếu chưa stage gì → gợi ý người dùng chạy `git add` trước (không tự add).

2. **Kiểm tra an toàn trên file đã stage.** Nếu có mục nào dưới đây thì cảnh báo, dừng lại và không commit:
   - `.env`, `.env.local` (chỉ `.env.example` được commit).
   - `node_modules/`, `.next/`.
   - Chuỗi giống mật khẩu, chuỗi kết nối MySQL thật (`mysql://user:matkhau@...`), `SESSION_SECRET` thật.

3. **Đọc quy ước dự án**: `CLAUDE.md` ở gốc (mục commit nếu có) và `./references/conventions.md`.

4. **Phân tích thay đổi**:
   ```bash
   git diff --staged
   ```

5. **Nhận diện loại và phạm vi** từ file và nội dung thay đổi (xem `./references/conventions.md`). Phạm vi lấy theo feature: `auth`, `staff`, `shifts`, `rates`, `attendance`, `adjustments`, `payroll`, `me`; hoặc `lib`, `shared`, `app`, `csdl`, `api`, `claude`.
   - Nếu thay đổi gồm nhiều việc không liên quan (ví dụ vừa thêm feature `rates` vừa sửa config ESLint) → gợi ý tách thành nhiều commit.

6. **Nhắc theo nghiệp vụ (không chặn, chỉ nhắc):**
   - Sửa `src/features/payroll/` hoặc hàm `calculatePay` mà không có file test nào được stage cùng: nhắc "Thay đổi tính lương nên có test".
   - Sửa `prisma/schema.prisma`: nhắc "Nhớ cập nhật `docs/DATABASE..md` và chạy lại `npm run db:push`".

7. **Sinh message** → hiển thị bản xem trước:

   ```
   📝 XEM TRƯỚC COMMIT

   tính năng(staff): thêm ô lương mặc định mọi ca

   - Thêm cột users.default_rate (có thể trống)
   - Form tạo và sửa nhân viên nhận defaultRate
   - Cập nhật context.md của staff

   File đã stage (4):
     M prisma/schema.prisma
     M src/features/staff/actions.ts
     A src/features/staff/schemas.ts
     M src/features/staff/context.md

   Commit? (có/không/sửa)
   ```

8. **Thực thi sau khi người dùng xác nhận**:
   - `có` → `git commit` với message đã xem trước (message nhiều dòng thì truyền qua heredoc).
   - `sửa` → người dùng sửa message, rồi mới commit.
   - `không` → hủy.

## Commit nhanh

Bỏ qua bước xem trước khi commit đơn giản và người dùng đã đưa sẵn loại + mô tả (vẫn chạy bước kiểm tra an toàn):

```
/git-commit tài liệu cập nhật SPEC.md
    ↓
git commit -m "tài liệu: cập nhật SPEC.md"
```

Nếu người dùng gõ loại bằng tiếng Anh (`feat`, `fix`...) → tự đổi sang loại tiếng Việt tương ứng trong `./references/conventions.md`.

## Quy tắc

- **Chỉ viết tiếng Việt có dấu**: cả loại, mô tả ngắn, nội dung và chân trang. Chỉ giữ nguyên tên riêng trong code (tên feature, file, hàm, thư viện).
- **Chỉ commit file đã stage**: không bao giờ tự `git add`.
- **Không tự push.** Chỉ push khi người dùng yêu cầu.
- **Phạm vi lấy từ đường dẫn**: `src/features/rates/` → `(rates)`; chi tiết ở `./references/conventions.md`.
- **Viết thường** loại và phạm vi.
- **Mô tả ngắn bắt đầu bằng động từ**: "thêm", "sửa", "xóa", "cập nhật", "tách", "chép"...
- **Không chấm câu** ở cuối mô tả ngắn.
- **Độ dài**: dòng đầu (cả phần `loại(phạm vi): `) ≤ 72 ký tự, nội dung xuống dòng ở khoảng 72 ký tự.
- **Không ghi** mật khẩu, chuỗi kết nối hay chuỗi bí mật vào message.
- **Không dùng** `--no-verify` hay bỏ qua hook trừ khi người dùng yêu cầu rõ. Không sửa commit đã push trừ khi người dùng yêu cầu.
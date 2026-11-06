# Web tính lương Fight Station

Web tính lương theo giờ, theo ca cho nhân viên quán Fight Station. Chủ quán nhập chấm công, chỉnh mức lương theo tháng, thưởng phạt và xem bảng lương của mọi người. Nhân viên đăng nhập xem lương của chính mình. Một ứng dụng Next.js 16 + Prisma + MySQL, triển khai lên Vercel.

File này chỉ để **điều hướng**. Thông tin chi tiết nằm ở file được trỏ tới bên dưới; đọc đúng file khi cần.

## ngôn ngữ

Luôn trả lời và giải thích bằng tiếng Việt, kể cả khi người dùng hỏi bằng tiếng Anh. Giữ nguyên tên kỹ thuật bằng tiếng Anh (tên hàm, tên file, lệnh, thuật ngữ như Server Action, commit). Commit message viết hoàn toàn bằng tiếng Việt có dấu, kể cả loại commit (xem /git-commit).Luôn trả lời và giải thích bằng tiếng Việt, kể cả khi người dùng hỏi bằng tiếng Anh. Giữ nguyên tên kỹ thuật bằng tiếng Anh (tên hàm, tên file, lệnh, thuật ngữ như Server Action, commit). Nội dung commit (subject và body) viết tiếng Việt, type và scope viết tiếng Anh.

## Cần gì, đọc ở đâu

| Cần | Đọc |
|---|---|
| Yêu cầu, quy tắc tính lương, màn hình, phân quyền, trạng thái dự án | [docs/SPEC.md](docs/SPEC.md) |
| Bảng, cột, ràng buộc, công thức lương, truy vấn mẫu | [docs/DATABASE..md](docs/DATABASE..md) |
| Quy ước đặt tên, cấu trúc feature, pattern bắt buộc, anti-pattern, Git, test | [docs/PROJECT-RULES.md](docs/PROJECT-RULES.md) |
| Cấu trúc thư mục, luồng request, đăng nhập, route, triển khai | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Server Action và hàm đọc theo feature, định dạng kết quả, mã lỗi | [docs/API_SPEC.md](docs/API_SPEC.md) |
| Một tính năng: `auth`, `staff`, `shifts`, `rates`, `attendance`, `adjustments`, `payroll`, `stats`, `me` | `src/features/<tên>/context.md` |
| Đã setup những gì, lệnh hay dùng | [docs/SETUP-NOTES.md](docs/SETUP-NOTES.md) (do skill `/init-base-nextjs-app` ghi) |
| Cách dùng Next.js 16 (khác các bản cũ) | `node_modules/next/dist/docs/` |

Nếu các file docs lệch nhau: `ARCHITECTURE.md` quyết định cấu trúc thư mục, `PROJECT-RULES.md` quyết định đặt tên và pattern, `DATABASE..md` quyết định schema, `API_SPEC.md` quyết định định dạng kết quả và mã lỗi.

## Available Skills

Skill của dự án ở `.claude/skills/<tên-skill>/SKILL.md`.

- /init-base-nextjs-app: dựng khung dự án (cấu trúc thư mục, thư viện, file cấu hình, Prisma schema, seed, đăng nhập, phân quyền) và ghi `docs/SETUP-NOTES.md`. Không viết code chức năng.

### Skill Routing

- "init project", "init base", "setup structure", "setup dự án" → `/init-base-nextjs-app`
- Skill chưa có thì báo user, không tự làm thay

## Quy tắc giữ file này gọn

- Không viết thông tin chi tiết vào đây. Viết vào đúng nơi: tính năng → `context.md` của tính năng; quy ước code → `docs/PROJECT-RULES.md`; cấu trúc → `docs/ARCHITECTURE.md`; DB → `docs/DATABASE..md`; Server Action và mã lỗi → `docs/API_SPEC.md`. Ở đây chỉ thêm một dòng trỏ tới.
- Trước khi sửa một tính năng, đọc `context.md` của nó; sửa xong thì cập nhật `context.md` theo code thật.
- Trước khi viết code Next.js, đọc tài liệu trong `node_modules/next/dist/docs/` vì Next.js 16 có thay đổi so với bản cũ.
- Khi tạo, đổi tên hoặc xóa skill trong `.claude/skills/`, cập nhật "Available Skills" và "Skill Routing" ở trên.

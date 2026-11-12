---
name: explain
description: >
  Giải thích code, khái niệm, luồng xử lý, quyết định thiết kế hoặc mã lỗi của web tính lương Fight Station
  cho người mới bắt đầu, và lưu bài giải thích vào docs/explain/.
  Dùng khi người dùng gõ /explain, hoặc nói "explain", "giải thích", "how does this work",
  "what is", "tại sao", "why" VÀ muốn một bài giải thích được lưu lại để học/đọc lại.
  Câu hỏi nhanh trong lúc làm việc (vd "tại sao server không chạy?") thì trả lời trực tiếp, không dùng skill này.
argument-hint: "[code|concept|flow|why|error] [target]"
allowed-tools:
  - Read
  - Write
---

# Giải thích cho người mới bắt đầu

Dự án là **một ứng dụng Next.js 16 + Prisma + MySQL** (không tách BE/FE), nên mỗi bài chỉ có một nơi lưu và một bộ tài liệu để đọc.

## Cách dùng

```
/explain code [feature]             → Code của feature làm gì
/explain concept [khái-niệm]        → Giải thích pattern/khái niệm (Server Action, revalidatePath, Zod...)
/explain flow [feature hoặc hành động] → Luồng từ giao diện đến database
/explain why [quyết định]           → Lý do đằng sau một quyết định thiết kế
/explain error [mã lỗi|thông báo]   → Lỗi nghĩa là gì, vì sao xảy ra, cách sửa
```

## Quy trình

1. **Không hỏi ngôn ngữ**: luôn viết bằng tiếng Việt, giữ nguyên tên kỹ thuật tiếng Anh (Server Action, Prisma, tên hàm, tên file).

2. **Xác định chế độ và target.** Thiếu chế độ → hỏi: code, concept, flow, why hay error? Target là feature mà không có trong danh sách hợp lệ → hỏi lại tên feature.

3. **Đọc tài liệu TRƯỚC (không quét source code):**

| Chế độ    | Thứ tự đọc |
| --------- | ---------- |
| `code`    | `src/features/<feature>/context.md` → `docs/ARCHITECTURE.md` mục 3 (giải phẫu một feature) |
| `concept` | `docs/PROJECT-RULES.md` → `docs/ARCHITECTURE.md` |
| `flow`    | `docs/ARCHITECTURE.md` mục 4 (luồng request) → `docs/API_SPEC.md` mục 4 và 6 → `context.md` của feature |
| `why`     | `docs/PROJECT-RULES.md` → `docs/ARCHITECTURE.md` → `docs/DATABASE..md` (nếu liên quan dữ liệu/công thức lương) → `docs/SPEC.md` (nếu liên quan quy tắc nghiệp vụ) |
| `error`   | `docs/API_SPEC.md` mục 5 (mã lỗi) → `context.md` của feature liên quan |

   **Kiểm tra trạng thái feature** (chế độ `code`, `flow`): nếu `context.md` ghi feature "chưa cài đặt" nghĩa là **chưa có code**. Báo người dùng; chỉ viết bài về **thiết kế dự kiến** nếu người dùng đồng ý, và ghi rõ "Thiết kế dự kiến, chưa có code" ở đầu bài. Trạng thái chung của dự án xem `docs/SPEC.md`.

4. **Chỉ đọc file source cụ thể** khi người dùng chỉ rõ đường dẫn chính xác.

5. **Dùng template**: `./templates/vi.md`, lấy mục tương ứng với chế độ (`code` → "File", `concept` → "Concept", `flow` → "Flow", `why` → "Tại sao", `error` → "Giải thích Lỗi").

6. **Lưu bài giải thích** (xem mục dưới), rồi báo người dùng đường dẫn file vừa lưu.

## Nơi lưu bài giải thích

```
docs/explain/
├── code/{feature}.md
├── concept/{khai-niem}.md
├── flow/{feature-hoac-hanh-dong}.md
├── why/{quyet-dinh}.md
└── error/{ma-loi}.md
```

- Tên file viết thường, nối bằng dấu gạch ngang (kebab-case):
  - `code/`: đúng tên feature, vd `code/attendance.md`
  - `flow/`: tên feature hoặc hành động, vd `flow/payroll.md`, `flow/them-cham-cong.md`
  - `concept/`, `why/`: tiếng Việt không dấu, vd `concept/server-action.md`, `why/luu-luong-theo-thang.md`
  - `error/`: mã lỗi viết thường theo `API_SPEC.md`, vd `error/auth-002.md`; không có mã thì mô tả ngắn không dấu, vd `error/prisma-p2002.md`
- File đã tồn tại → hỏi người dùng muốn **ghi đè** hay **tạo bản mới** (thêm hậu tố `-v2`, `-v3`...). Mặc định gợi ý ghi đè, vì lịch sử đã có trong git.
- Đầu mỗi file ghi rõ: chế độ, target, **ngày viết** và các tài liệu đã đọc (để biết bài có thể đã cũ khi code thay đổi).

## Vị trí tài liệu

```
docs/
├── SPEC.md             ← yêu cầu, quy tắc tính lương, màn hình, phân quyền, trạng thái dự án
├── DATABASE..md        ← bảng, cột, ràng buộc, công thức lương
├── PROJECT-RULES.md    ← quy ước đặt tên, pattern bắt buộc, anti-pattern
├── ARCHITECTURE.md     ← cấu trúc thư mục, luồng request, đăng nhập, route, triển khai
├── API_SPEC.md         ← Server Action, hàm đọc, định dạng kết quả, mã lỗi
└── explain/            ← nơi lưu bài giải thích

src/features/{feature}/context.md
```

Feature hợp lệ: `auth`, `staff`, `shifts`, `rates`, `attendance`, `adjustments`, `payroll`, `stats`, `me`.

Nếu các file docs lệch nhau: `ARCHITECTURE.md` quyết định cấu trúc thư mục, `PROJECT-RULES.md` quyết định đặt tên và pattern, `DATABASE..md` quyết định schema, `API_SPEC.md` quyết định định dạng kết quả và mã lỗi.

## Quy tắc

- **KHÔNG BAO GIỜ Glob/quét source code**; tài liệu đã chứa các quyết định kiến trúc, `context.md` chứa chi tiết từng feature.
- Chỉ đọc source khi người dùng đưa đường dẫn file chính xác.
- Next.js 16 khác các bản cũ: nếu bài nói về cách dùng framework (Server Action, caching, routing), đối chiếu `node_modules/next/dist/docs/` thay vì dựa vào trí nhớ.
- Chỉ dùng Write để lưu bài vào `docs/explain/`, không sửa file nào khác.

## Xử lý lỗi

| Tình huống | Hành động |
| ---------- | --------- |
| Thiếu chế độ | Hỏi: code, concept, flow, why hay error? |
| Feature không có trong danh sách | Hỏi lại tên feature |
| Không có `context.md` | Đọc `docs/ARCHITECTURE.md` thay thế |
| `context.md` ghi chưa cài đặt | Báo feature chưa có code; hỏi có muốn bài thiết kế dự kiến không |
| Cần chi tiết source | Hỏi người dùng đường dẫn file cụ thể |
| File giải thích đã tồn tại | Hỏi: ghi đè hay tạo bản mới? |

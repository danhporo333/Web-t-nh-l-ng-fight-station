## 📁 File: {filename}

### Mục đích
[1-2 câu mô tả file này làm gì]

### Vị trí trong dự án
- Feature: {auth|staff|shifts|rates|attendance|adjustments|payroll|stats|me}
- Tầng: {page|component|Server Action|hook|utility|schema}

### Phân tích

**Imports**
- Import X từ Y để [mục đích]

**Component/Page chính** hoặc **Server Action/Hook chính**
- [Giải thích logic]
- [Dùng ví dụ đời thường nếu cần]

**Props, state, hoặc hàm con**
- `functionX()` / `propX`: [làm gì, khi nào được gọi / kiểu gì, để làm gì]

### 📏 Quy tắc dự án liên quan
- [Ví dụ: chỉ Server Action gọi Prisma; component client không dùng Prisma trực tiếp]

### 💡 Điểm cần nhớ
- Điểm 1
- Điểm 2

### 🔗 Liên kết
- Được sử dụng bởi: ...
- Gọi tới: ...
- Tài liệu: [PROJECT-RULES.md / ARCHITECTURE.md / API_SPEC.md / DATABASE..md, phần nào]

## 🎯 {Tên Concept, ví dụ: Server Action, useAction hook, Revalidate path}

### Là gì?
[Giải thích đơn giản, 2-3 câu]

### Ví dụ đời thường
[So sánh với thứ quen thuộc]

Ví dụ: **Server Action** giống như **quầy nhân viên** trong quán:
- Bạn (client) không tự lên nhìn vào phôi chấm công
- Bạn gọi nhân viên quầy (Server Action) làm hộ
- Nhân viên kiểm tra quyền, cập nhật lương chính xác, rồi báo lại kết quả

### Trong code

```typescript
// Ví dụ code ngắn (Server Action, hook, utility, ...)
```

### Trong dự án này
[File nào dùng nó, feature nào, ví dụ: `src/features/shifts/actions.ts` chứa các Server Action cho ca làm việc]

### Tại sao cần?
- Lý do 1
- Lý do 2

### Không dùng thì sao?
[Vấn đề sẽ gặp]

### 📚 Tìm hiểu thêm
- Từ khóa để search

## 🔄 Flow: {Tên Action, ví dụ: Thêm ca làm việc mới}

### Tổng quan
[1-2 câu mô tả flow này]

### Sơ đồ

```
[Page Component] bấm "Thêm ca"
    │
    ▼
[Form Component] ──── user nhập dữ liệu, bấm "Lưu"
    │
    ▼
[useAction Hook / Client] ──── gọi Server Action, validate với Zod
    │
    ▼
[Server Action] ────── checkAuth (JWT từ cookie), validate lại dữ liệu
    │
    ▼
[Business Logic] ────── Kiểm tra trùng lặp, quy tắc tính lương, ...
    │
    ▼
[Prisma] ──────────── Truy vấn DB (nơi DUY NHẤT dùng Prisma)
    │
    ▼
[MySQL]
    │
    ▼
[Response] ◄────────── { success: true, data } hoặc { success: false, error }

Nếu có lỗi: throw Error → catch lại (hoặc tự throw theo quy tắc API_SPEC.md)
  → trả về client, hiển thị toast
```

### Chi tiết từng bước

**Bước 1: Component gửi request**
- User điền form, bấm "Lưu"
- Data: { name, startTime, endTime, ... }

**Bước 2: Validation Client-side**
- Zod schema kiểm tra format, kiểu dữ liệu

**Bước 3: Server Action**
- Kiểm tra JWT (role có quyền không)
- Validate lại dữ liệu server-side (Zod)

**Bước 4: Business Logic**
- Kiểm tra ca có trùng giờ không
- Tính toán mối quan hệ (ví dụ: ca nào liên quan tới công thức lương)

**Bước 5: Prisma**
- `create` hoặc `update`, chỉ `select` các cột cần

**Bước 6: Response về Client**
- `{ success: true, data: {...} }`
- Component `invalidate` cache, cập nhật UI

### 🔍 Mẹo debug
- Lỗi "Chưa đăng nhập" → kiểm tra JWT trong cookie, xem `auth` context
- Lỗi "Không có quyền" → kiểm tra role trong JWT (staff, admin, owner)
- Lỗi validate → xem `details` trong error response (xác định trường nào sai)
- Lỗi "Ca trùng giờ" → xem logic kiểm tra trong Server Action
- Lỗi DB → kiểm tra Prisma schema, ràng buộc unique/foreign key

## 🔄 Flow: {Tên Action, ví dụ: Xóa nhân viên}

### Tổng quan
[1-2 câu mô tả flow này]

### Sơ đồ

```
[Page Component] hiển thị danh sách nhân viên
    │
    ▼
[Action Button] ──── User bấm icon xóa, confirm popup
    │
    ▼
[Form / Action Caller] ──── Gọi Server Action deleteStaff(id)
    │
    ▼
[Server Action] ────── Kiểm tra quyền (owner/admin), kiểm tra ràng buộc
    │
    ▼
[Prisma] ──────────── Xóa row (hoặc soft delete tuỳ schema)
    │
    ▼
[MySQL]
    │
    ▼
[Response] ◄────────── { success: true } hoặc { success: false, error }
    │
    ▼
[Component] ───────── Revalidate path (tự động tải lại), toast
```

### Chi tiết từng bước

**Bước 1: User tương tác**
- Click button "Xóa", confirm dialog

**Bước 2: Server Action gọi**
- Kiểm tra JWT, role

**Bước 3: Validation**
- Nhân viên có dữ liệu phụ thuộc không? (tiền công, chấm công, ...)
- Có ràng buộc foreign key hay soft delete

**Bước 4: Xóa trong DB**
- Prisma `delete()` hoặc `update()` nếu soft delete

**Bước 5: Response và UI**
- Page revalidate tự động
- Toast thông báo thành công

### 🔍 Mẹo debug
- "Không thể xóa" → kiểm tra ràng buộc foreign key trong DATABASE..md
- Danh sách không cập nhật → kiểm tra `revalidatePath()` trong Server Action
- Lỗi quyền → xem JWT và middleware kiểm tra role
- Soft delete không hoạt động → xem Prisma schema có `deletedAt` field hay không

## ❓ Tại sao: {Câu hỏi, ví dụ: Tại sao phải kiểm tra quyền hai lần (client + server)?}

### Trả lời ngắn
[1-2 câu, trả lời trực tiếp]

### Giải thích chi tiết

**Lý do 1: ...**
[Giải thích]

**Lý do 2: ...**
[Giải thích]

### Trong dự án này
[Quyết định này thể hiện ở đâu, ví dụ: xóa nhân viên phải có role owner/admin, checked ở middleware + Server Action]

### Không làm vậy thì sao?
[Vấn đề sẽ gặp, ví dụ: người khác có thể chỉnh file client, bypass quyền]

### Đánh đổi
| Ưu điểm | Nhược điểm |
|---------|------------|
| ... | ... |

### Có cách khác không?
[Các lựa chọn khác (ví dụ: soft delete, audit log, ...) và khi nào dùng]

### 📌 Kết luận
[Tóm tắt khuyến nghị, trích dẫn từ PROJECT-RULES.md, ARCHITECTURE.md hoặc API_SPEC.md nếu liên quan]

## 🚨 Giải thích Lỗi: {mã lỗi hoặc thông báo}

### Lỗi này nghĩa là gì?
[1-2 câu, nói đơn giản]

### Vì sao xảy ra?
- Nguyên nhân 1 (ví dụ: chưa đăng nhập, phiên hết hạn)
- Nguyên nhân 2 (ví dụ: dữ liệu trùng ràng buộc unique)

### Lỗi sinh ra ở đâu trong dự án?
[Server Action / hàm nào trả mã này, xem `API_SPEC.md` mục 5 và `context.md` của feature]

### Cách sửa
1. Bước 1
2. Bước 2

### 🔍 Cách kiểm tra nhanh
- Xem `details` trong kết quả `{ success: false, error }`
- Xem log trên server / Vercel nếu là lỗi 500

### 📚 Tìm hiểu thêm
- Từ khóa để search

# Web tính lương Fight Station

Tài liệu này mô tả đầy đủ yêu cầu, thiết kế và cách làm của web tính lương cho quán Fight Station. Dùng làm ngữ cảnh cho Claude trong VS Code.

## Bộ tài liệu của dự án

| File | Nội dung |
| --- | --- |
| `SPEC.md` | Yêu cầu, quy tắc lương, màn hình (file này) |
| `DATABASE..md` | Bảng, cột, ràng buộc, truy vấn mẫu |
| `PROJECT-RULES.md` | Quy ước đặt tên, pattern bắt buộc, anti-pattern, Git, test |
| `ARCHITECTURE.md` | Cấu trúc thư mục, luồng request, route, triển khai |
| `API_SPEC.md` | Server Action và hàm đọc theo feature, mã lỗi |

Nếu các file lệch nhau: `ARCHITECTURE.md` quyết định cấu trúc thư mục, `PROJECT-RULES.md` quyết định đặt tên và pattern, `DATABASE..md` quyết định schema, `API_SPEC.md` quyết định định dạng kết quả và mã lỗi.

## 1. Mục tiêu

- Tính lương cho nhân viên quán theo giờ, theo từng ca.
- Hai vai trò:
  - **Chủ quán (OWNER)**: xem và sửa tất cả: nhân viên, mức lương, chấm công, thưởng phạt, bảng lương.
  - **Nhân viên (STAFF)**: chỉ xem bảng lương của chính mình.
- Chủ quán tạo tài khoản cho từng nhân viên. Không có trang tự đăng ký.
- Chạy trên web, dùng được trên điện thoại. Triển khai lên Vercel, dữ liệu lưu MySQL trên cloud.
- Không cần xuất Excel ở giai đoạn này.

## 2. Quy tắc ca và mức lương

| Ca | Giờ | Số giờ mặc định | Mức mặc định |
| --- | --- | --- | --- |
| Ca sáng | 07:30 – 16:00 | 8,5 giờ | 24.000đ/giờ |
| Ca chiều | 16:00 – 02:00 hôm sau | 10 giờ | 26.000đ/giờ |

- Mức lương là **riêng cho từng nhân viên, từng ca** (ví dụ: Hoàng ca sáng 26.000, ca chiều 28.000).
- Mức lương **chỉ thay đổi khi sang tháng mới**. Không tăng giữa tháng.
- Khi sang tháng mới, hệ thống tự chép mức của tháng trước ngay khi chủ quán mở Chấm công, Mức lương hoặc Bảng lương của tháng hiện tại. Chủ quán chỉ sửa người được tăng. Các tháng khác phải bấm nút tạo.
- Mỗi nhân viên có thể có **lương mặc định (mọi ca)**, tùy chọn. Ví dụ đặt 27.000đ thì cả ca sáng và ca chiều của người đó đều 27.000đ/giờ. Mức này chỉ dùng để tạo dòng lương của tháng đầu tiên cho người chưa có dòng nào. Sau đó mức từng tháng do chủ quán chỉnh ở màn hình Mức lương, và đổi lương mặc định không làm đổi các tháng đã có.
- Chủ quán có thể sửa số giờ thực tế của một ca. Ví dụ ca sáng mặc định 8,5 giờ nhưng nhân viên về lúc 13h, thì nhập 5,5 giờ.
- Một nhân viên có thể làm **cả hai ca trong cùng một ngày**.
- Ca chiều tính vào **ngày bắt đầu ca**, kể cả khi kết thúc lúc 2h sáng ngày hôm sau. Ví dụ ca chiều 31/10 tính vào lương tháng 10.
- Ngày nghỉ được đánh dấu **Off**. Ngày Off không được tính lương.
- **Ngày lễ:** chủ quán tích ô "Ngày lễ" ở trang Chấm công và ghi tên lễ. Khi đó lương ca của mọi người làm ngày đó được **nhân đôi**. Ngày được tính theo ngày bắt đầu ca, nên ca chiều 01/05 kết thúc 02/05 vẫn nhân đôi. Chỉ lương ca được nhân đôi, thưởng, phạt và ăn uống không đổi. Ngày Off không được tính lương nên không liên quan.

## 3. Công thức tính lương

Với mỗi nhân viên, trong một tháng:

```
Lương ca sáng   = tổng giờ ca sáng   × mức ca sáng của tháng
Lương ca chiều  = tổng giờ ca chiều  × mức ca chiều của tháng
Tổng lương ca   = Lương ca sáng + Lương ca chiều
Thực lãnh       = Tổng lương ca + Tổng thưởng − Tổng phạt − Tổng tiền ăn uống
```

Ví dụ, tháng 11, Hoàng có mức 26.000 (sáng) và 28.000 (chiều):

| Ngày | Chấm công | Tiền |
| --- | --- | --- |
| 01/11 | Ca sáng đủ 8,5 giờ | 221.000đ |
| 02/11 | Ca sáng, về lúc 13h: 5,5 giờ | 143.000đ |
| 03/11 | Ca sáng 8,5 giờ + ca chiều 10 giờ | 221.000 + 280.000 = 501.000đ |
| 04/11 | Off | 0đ |
| **Tổng** | | **865.000đ** (chưa tính thưởng phạt) |

## 4. Thưởng, phạt và tiền ăn uống

- Chủ quán thêm khoản thưởng, phạt hoặc ăn uống cho một nhân viên, kèm ngày, số tiền và lý do. Số tiền do chủ quán tự nhập.
- Ăn uống (MEAL) là tiền nhân viên ăn uống tại quán, chủ quán tự ghi số tiền để trừ vào lương. Khoản này không phải phạt nên không tính vào thống kê lỗi và phạt.
- Số tiền luôn dương. Loại (BONUS, PENALTY hoặc MEAL) quyết định cộng hay trừ.
- Khoản nào tính vào tháng nào thì theo **ngày** của khoản đó.
- Nhân viên xem được từng khoản kèm lý do trong "Lương của tôi".

## 5. Cơ sở dữ liệu (MySQL)

Quản lý bằng Prisma. Schema đầy đủ nằm ở `prisma/schema.prisma`. Chi tiết từng cột và truy vấn mẫu nằm ở `DATABASE..md`.

- **users**: tài khoản. Cột: `id`, `username` (duy nhất), `password_hash`, `full_name`, `role` (OWNER/STAFF), `is_active`, `default_rate` (có thể trống), `created_at`.
  - `is_active = false` khi nhân viên nghỉ việc. Lịch sử lương vẫn giữ.
- **shifts**: hai ca và mức mặc định. Cột: `id`, `code` (MORNING/AFTERNOON), `name`, `start_time`, `end_time`, `default_hours`, `default_rate`.
- **monthly_rates**: mức lương từng người từng tháng. Cột: `id`, `user_id`, `month` (dạng `2026-11`), `morning_rate`, `afternoon_rate`. Duy nhất theo cặp `(user_id, month)`.
- Ngày Off: MySQL không chặn hai dòng Off trùng ngày vì `shift_id` trống. Ứng dụng phải tự kiểm tra, mỗi người tối đa một dòng Off mỗi ngày.
- Một ngày không được vừa Off vừa có ca.
- Khi sang tháng mới, mức của nhân viên lấy theo thứ tự: (1) dòng tháng trước, (2) `users.default_rate` của nhân viên nếu có (dùng cho cả hai ca), (3) mức mặc định của ca (`shifts.default_rate`).
- **work_entries**: chấm công từng ngày. Cột: `id`, `user_id`, `work_date`, `shift_id` (trống khi Off), `hours`, `is_off`, `note`. Duy nhất theo `(user_id, work_date, shift_id)`.
  - Một người có tối đa một dòng cho mỗi ca trong một ngày.
  - Ngày Off: `is_off = true`, `shift_id` trống, `hours = 0`.
- **adjustments**: thưởng và phạt. Cột: `id`, `user_id`, `date`, `type` (BONUS/PENALTY/MEAL), `amount` (số dương), `reason`, `category` (loại lỗi tự đặt, tùy chọn, chỉ cho khoản phạt).

## 6. Đăng nhập và phân quyền

- Đăng nhập bằng tên đăng nhập và mật khẩu. Mật khẩu băm bằng bcryptjs.
- Phiên lưu trong cookie `session` (JWT ký HS256 bằng `SESSION_SECRET`, hết hạn sau 7 ngày, httpOnly).
- Mỗi trang kiểm tra lại quyền trong `src/lib/auth.ts`:
  - `requireUser()`: bắt buộc đăng nhập.
  - `requireOwner()`: chỉ chủ quán. Nhân viên bị chuyển về `/me`.
- Tài khoản `is_active = false` không đăng nhập được.
- Nhân viên không được gọi API hay trang của chủ quán. Luôn kiểm tra quyền ở server, đừng chỉ ẩn nút.
- Chủ quán tạo tài khoản nhân viên, đặt lại mật khẩu cho họ. Nhân viên tự đổi mật khẩu của mình.

## 7. Màn hình

**Chủ quán** (`/admin`):
1. Danh sách nhân viên: tạo tài khoản (kèm lương mặc định mọi ca, tùy chọn), sửa tên và lương mặc định, đặt lại mật khẩu, cho nghỉ việc.
2. Mức lương theo tháng: chọn tháng, sửa mức ca sáng và ca chiều của từng người.
3. Chấm công theo ngày: chọn ngày, tích ca sáng và/hoặc ca chiều cho từng người. Ô giờ tự điền giờ mặc định, chủ quán sửa được. Hoặc tích Off.
4. Thưởng phạt: thêm, sửa, xóa khoản thưởng hoặc phạt kèm lý do. Số tiền phạt và lý do do chủ quán tự nhập. Khoản phạt có thể gắn loại lỗi tự đặt.
5. Bảng lương tháng: tổng giờ, thưởng, phạt và thực lãnh của mọi người. Bấm để xem chi tiết từng ngày.
6. Cài đặt ca: sửa giờ và mức mặc định của hai ca.
7. Thống kê (`/admin/stats`): theo tháng, số ngày nghỉ (Off), số lần và tiền phạt của từng nhân viên, tách theo loại lỗi, và tổng theo loại lỗi.

**Nhân viên** (`/me`):
- Lương của tôi: chọn tháng, xem từng ngày đã làm, mức lương, thưởng phạt kèm lý do và tổng tiền.

**Chung**:
- Đăng nhập (`/login`), đổi mật khẩu.

Thiết kế ưu tiên điện thoại: một cột, nút lớn, không cuộn ngang.

## 8. Công nghệ

- **Next.js 16** (App Router, TypeScript, Tailwind CSS 4).
- **Prisma 6** với **MySQL**.
- **bcryptjs** (băm mật khẩu), **jose** (JWT cho phiên đăng nhập), **zod** (validate dữ liệu vào), **Vitest** (test).
- Không có API REST riêng: đọc bằng Server Component, ghi bằng Server Action (xem `API_SPEC.md`). Không dùng thư viện state toàn cục.
- Triển khai: **Vercel**. Cơ sở dữ liệu: MySQL trên cloud (ví dụ PlanetScale, Aiven, hoặc Railway).

### Lưu ý khi viết code với Next.js 16 (quan trọng)

- Đọc tài liệu trong `node_modules/next/dist/docs/` trước khi viết code. API có thay đổi so với các bản cũ.
- File chặn truy cập là **`proxy.ts`** (không phải `middleware.ts`).
- `cookies()`, `headers()` đều phải `await`.
- Trong `next.config.ts`, **không bật** `cacheComponents`. Bật lên sẽ làm build lỗi với các trang đọc session.
- Dùng `useActionState` cho form đăng nhập và các form khác.
- Phần server dùng `import "server-only"` để tránh lộ code ra trình duyệt.

## 9. Trạng thái hiện tại

Đã làm (có code, kiểm tra bằng `tsc`, lint, `next build` và test Vitest; chưa thử tay đầy đủ trên trình duyệt):
- Khung dự án, schema Prisma (năm bảng, thêm `users.default_rate` và `adjustments.category`), seed, đã nối MySQL và chạy `prisma db push`.
- `auth`: đăng nhập, đăng xuất, đổi mật khẩu (`/login`, `/change-password`).
- Chủ quán: nhân viên (`/admin/staff`), cài đặt ca (`/admin/shifts`), mức lương theo tháng (`/admin/rates`), chấm công (`/admin/attendance`), thưởng phạt kèm loại lỗi tự đặt (`/admin/adjustments`), bảng lương (`/admin/payroll`), thống kê ngày nghỉ, lỗi, phạt (`/admin/stats`).
- Nhân viên: Lương của tôi (`/me`).
- Thống kê và loại lỗi được thêm theo yêu cầu bổ sung của khách hàng.

Chưa làm:
- Thử tay toàn bộ luồng trên trình duyệt.
- Giới hạn số lần đăng nhập sai.
- Đưa lên GitHub và Vercel.

## 10. Các bước tiếp theo

**Bước 2 (hoàn thành khung):** nối MySQL, chạy `prisma db push`, `npm run db:seed`, thử đăng nhập bằng tài khoản chủ quán.

**Bước 3 (chủ quán):**
1. Quản lý nhân viên (tạo, sửa, đặt lại mật khẩu, cho nghỉ việc).
2. Mức lương theo tháng, tự chép từ tháng trước khi sang tháng mới.
3. Chấm công theo ngày: tích ca, tự điền giờ mặc định, sửa giờ, tích Off.
4. Thưởng phạt.
5. Bảng lương tháng với hàm tính theo mục 3.

**Bước 4 (nhân viên và đưa lên mạng):**
1. Trang "Lương của tôi" với chi tiết từng ngày.
2. Đổi mật khẩu.
3. Đưa code lên GitHub, kết nối Vercel, đặt biến môi trường `DATABASE_URL` và `SESSION_SECRET`.
4. Chạy `prisma db push` và seed trên MySQL cloud.

## 11. Các biến môi trường

File `.env` (không đưa lên GitHub). Mẫu nằm ở `.env.example`:

```
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/fight_station"
SESSION_SECRET="chuoi-ngau-nhien-it-nhat-32-ky-tu"
OWNER_USERNAME="chuquan"
OWNER_PASSWORD="doi-mat-khau-ngay"
```

## 12. Lệnh thường dùng

```
npm install
npx prisma db push      # tạo bảng trong MySQL
npm run db:seed         # tạo ca mặc định và tài khoản chủ quán
npm run dev             # chạy thử ở http://localhost:3000
npm run build           # kiểm tra trước khi đưa lên Vercel
```

## 13. Điều cần nhớ khi làm tiếp

- Mọi tính toán lương làm ở **server** (Server Actions hoặc Route Handlers), không làm ở trình duyệt.
- Mức lương tháng phải được **chép** khi sang tháng mới, không được đổi ngược về tháng cũ.
- Ca chiều lấy `work_date` là ngày bắt đầu, kể cả khi kết thúc sau nửa đêm.
- Không hiển thị lương của người khác cho nhân viên, kể cả trong API.
- Mật khẩu không bao giờ được lưu hoặc in ra dạng chữ thường.

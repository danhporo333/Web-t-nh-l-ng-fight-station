# Cơ sở dữ liệu web tính lương Fight Station

Cơ sở dữ liệu MySQL, quản lý bằng Prisma. Schema đầy đủ nằm ở `prisma/schema.prisma`. Tài liệu này mô tả từng bảng, từng cột và các quy tắc dữ liệu.

## Sơ đồ quan hệ

```
users 1 ──── n monthly_rates
users 1 ──── n work_entries  n ──── 1 shifts
users 1 ──── n adjustments
```

## Bảng `users`

Tài khoản chủ quán và nhân viên.

| Cột | Kiểu | Ràng buộc | Ghi chú |
| --- | --- | --- | --- |
| id | INT | khóa chính, tự tăng | |
| username | VARCHAR(50) | duy nhất, bắt buộc | Tên đăng nhập |
| password_hash | VARCHAR(100) | bắt buộc | Mật khẩu đã băm bcrypt, không bao giờ lưu chữ thường |
| full_name | VARCHAR(100) | bắt buộc | Họ tên hiển thị |
| role | ENUM(OWNER, STAFF) | mặc định STAFF | OWNER là chủ quán |
| is_active | BOOLEAN | mặc định true | false khi nhân viên nghỉ việc. Không xóa để giữ lịch sử lương |
| default_rate | INT | có thể trống | Lương mặc định mọi ca, đồng/giờ. Ví dụ 27000 thì cả hai ca đều 27.000đ. Trống thì dùng mức mặc định của từng ca |
| created_at | DATETIME | mặc định hiện tại | |

Quy tắc:
- Chủ quán tạo tài khoản nhân viên. Không có đăng ký công khai.
- Tài khoản có `is_active = false` không đăng nhập được.

## Bảng `shifts`

Hai ca cố định và mức mặc định. Chủ quán có thể sửa giờ và mức mặc định.

| Cột | Kiểu | Ràng buộc | Ghi chú |
| --- | --- | --- | --- |
| id | INT | khóa chính, tự tăng | |
| code | ENUM(MORNING, AFTERNOON) | duy nhất | Mã ca |
| name | VARCHAR(50) | bắt buộc | "Ca sáng", "Ca chiều" |
| start_time | VARCHAR(5) | bắt buộc | Dạng "HH:MM", ví dụ "07:30" |
| end_time | VARCHAR(5) | bắt buộc | Dạng "HH:MM", ví dụ "16:00" |
| default_hours | DECIMAL(4,2) | bắt buộc | Số giờ mặc định của ca |
| default_rate | INT | bắt buộc | Mức mặc định, đồng/giờ |

Dữ liệu ban đầu (do seed tạo):

| code | name | start_time | end_time | default_hours | default_rate |
| --- | --- | --- | --- | --- | --- |
| MORNING | Ca sáng | 07:30 | 16:00 | 8.50 | 24000 |
| AFTERNOON | Ca chiều | 16:00 | 02:00 | 10.00 | 26000 |

Lưu ý: ca chiều kết thúc lúc 02:00 hôm sau. Ứng dụng tự hiểu điều này, cột `end_time` chỉ để hiển thị.

## Bảng `monthly_rates`

Mức lương của từng nhân viên cho từng ca, trong từng tháng.

| Cột | Kiểu | Ràng buộc | Ghi chú |
| --- | --- | --- | --- |
| id | INT | khóa chính, tự tăng | |
| user_id | INT | khóa ngoại → users.id | |
| month | CHAR(7) | bắt buộc | Dạng "YYYY-MM", ví dụ "2026-11" |
| morning_rate | INT | bắt buộc | Đồng/giờ ca sáng của tháng này |
| afternoon_rate | INT | bắt buộc | Đồng/giờ ca chiều của tháng này |

Ràng buộc:
- Duy nhất theo cặp `(user_id, month)`. Mỗi người chỉ có một dòng mỗi tháng.

Quy tắc nghiệp vụ:
- Mức lương **chỉ đổi khi sang tháng mới**. Không đổi giữa tháng.
- Khi sang tháng mới, hệ thống **chép** dòng của tháng trước sang tháng mới. Chủ quán chỉ sửa người được tăng lương.
- Nếu nhân viên chưa có dòng của tháng trước, lấy theo thứ tự: `users.default_rate` của nhân viên (nếu có, dùng cho cả `morning_rate` và `afternoon_rate`), rồi mới đến mức mặc định của từng ca (`shifts.default_rate`).
- Đổi `users.default_rate` không làm đổi các dòng `monthly_rates` đã có. Muốn đổi một tháng thì sửa trực tiếp ở màn hình Mức lương.

## Bảng `work_entries`

Chấm công từng ngày. Mỗi ca làm là một dòng. Ngày nghỉ là một dòng riêng với `is_off = true`.

| Cột | Kiểu | Ràng buộc | Ghi chú |
| --- | --- | --- | --- |
| id | INT | khóa chính, tự tăng | |
| user_id | INT | khóa ngoại → users.id | |
| work_date | DATE | bắt buộc | Ngày **bắt đầu** ca |
| shift_id | INT | khóa ngoại → shifts.id, có thể trống | Trống khi là ngày Off |
| hours | DECIMAL(4,2) | mặc định 0 | Số giờ thực tế, chủ quán có thể sửa |
| is_off | BOOLEAN | mặc định false | true khi là ngày nghỉ |
| note | VARCHAR(255) | có thể trống | Ví dụ "về sớm lúc 13h" |

Ràng buộc:
- Duy nhất theo `(user_id, work_date, shift_id)`.
- Lưu ý: MySQL coi các giá trị NULL là khác nhau, nên với ngày Off (`shift_id` trống) ràng buộc này **không** chặn được hai dòng Off trùng. Ứng dụng phải tự kiểm tra: mỗi người chỉ có tối đa một dòng Off mỗi ngày.

Quy tắc nghiệp vụ:
- Một người có thể có **tối đa hai dòng** trong một ngày: một dòng ca sáng và một dòng ca chiều.
- Ca chiều tính vào `work_date` là ngày bắt đầu. Ví dụ ca chiều 05/11 kết thúc lúc 02:00 ngày 06/11 vẫn ghi `work_date = 2026-11-05`.
- Khi tích một ca, `hours` tự điền bằng `shifts.default_hours`. Chủ quán sửa được.
- Ngày Off: `is_off = true`, `shift_id` trống, `hours = 0`.
- Một ngày không được vừa Off vừa có ca. Ứng dụng phải chặn.

## Bảng `holiday_days`

Ngày lễ do chủ quán đánh dấu. Có dòng nghĩa là lương ca của ngày đó nhân đôi. Không có dòng nghĩa là ngày thường.

| Cột | Kiểu | Ràng buộc | Ghi chú |
| --- | --- | --- | --- |
| id | INT | khóa chính, tự tăng | |
| work_date | DATE | duy nhất, bắt buộc | Ngày lễ. Khớp với `work_entries.work_date` (ngày bắt đầu ca) |
| note | VARCHAR(255) | bắt buộc | Tên ngày lễ, ví dụ "Giỗ Tổ Hùng Vương" |

Quy tắc nghiệp vụ:
- Tích ô "Ngày lễ" thì tạo hoặc cập nhật dòng. Bỏ tích thì xóa dòng.
- Hệ số nhân đôi cố định là 2, không lưu trong bảng.

## Bảng `adjustments`

Thưởng và phạt.

| Cột | Kiểu | Ràng buộc | Ghi chú |
| --- | --- | --- | --- |
| id | INT | khóa chính, tự tăng | |
| user_id | INT | khóa ngoại → users.id | |
| date | DATE | bắt buộc | Ngày ghi nhận. Khoản này tính vào tháng của ngày này |
| type | ENUM(BONUS, PENALTY, MEAL) | bắt buộc | Thưởng (cộng), phạt (trừ) hoặc tiền ăn uống tại quán (trừ) |
| amount | INT | bắt buộc, luôn dương | Số tiền đồng |
| reason | VARCHAR(255) | bắt buộc | Ví dụ "đi trễ 30 phút", "làm tốt dịp lễ" |
| category | VARCHAR(50) | có thể trống | Loại lỗi do chủ quán tự đặt (ví dụ "đi trễ", "nghỉ không phép"), chỉ dùng cho khoản phạt. Dùng để thống kê |

Quy tắc nghiệp vụ:
- `amount` luôn là số dương. `type` quyết định cộng hay trừ.
- Nhân viên xem được từng khoản kèm lý do.

## Công thức tính lương tháng

Với một nhân viên trong tháng `M`:

```
giờ_sáng   = SUM(hours) của work_entries có shift_id = MORNING, is_off = false, work_date trong tháng M
giờ_chiều  = SUM(hours) của work_entries có shift_id = AFTERNOON, is_off = false, work_date trong tháng M

giờ_lễ_sáng  = phần giờ sáng ở trên có work_date nằm trong holiday_days
giờ_lễ_chiều = phần giờ chiều ở trên có work_date nằm trong holiday_days

lương_sáng  = (giờ_sáng  + giờ_lễ_sáng)  × monthly_rates.morning_rate
lương_chiều = (giờ_chiều + giờ_lễ_chiều) × monthly_rates.afternoon_rate
(giờ ngày lễ được cộng thêm một lần, nên tổng là ×2. Thưởng, phạt, ăn uống không nhân đôi)
tổng_ca     = lương_sáng + lương_chiều

thưởng = SUM(amount) của adjustments type = BONUS, date trong tháng M
phạt   = SUM(amount) của adjustments type = PENALTY, date trong tháng M
ăn_uống = SUM(amount) của adjustments type = MEAL, date trong tháng M

thực_lãnh = tổng_ca + thưởng − phạt − ăn_uống
```

Ví dụ, tháng 11, Hoàng có mức 26.000 (sáng) và 28.000 (chiều):

| Ngày | Chấm công | Tiền |
| --- | --- | --- |
| 01/11 | Ca sáng 8,5 giờ | 221.000đ |
| 02/11 | Ca sáng, về 13h: 5,5 giờ | 143.000đ |
| 03/11 | Ca sáng 8,5 giờ + ca chiều 10 giờ | 221.000 + 280.000 = 501.000đ |
| 04/11 | Off | 0đ |
| **Tổng** | | **865.000đ** |

## Truy vấn mẫu (Prisma)

Ứng dụng dùng Prisma Client, không viết SQL thô. Các ví dụ dưới đây nằm trong `queries.ts` của từng feature (xem `PROJECT-RULES.md`). Phép nhân giờ với mức lương làm ở hàm `calculatePay`, không làm trong truy vấn.

Khoảng của một tháng (ví dụ `"2026-11"`), dùng chung cho các truy vấn bên dưới:

```ts
const month = "2026-11";
const start = new Date(`${month}-01`); // 2026-11-01, giờ UTC
const end = new Date(start);
end.setUTCMonth(end.getUTCMonth() + 1); // 2026-12-01, không gồm ngày này
```

Tổng giờ của mọi nhân viên trong tháng, theo từng ca (không tính ngày Off):

```ts
const hours = await prisma.workEntry.groupBy({
  by: ["userId", "shiftId"],
  where: { isOff: false, workDate: { gte: start, lt: end } },
  _sum: { hours: true }, // Decimal, đổi sang number bằng Number(...)
});
```

Mức lương của mọi nhân viên trong tháng:

```ts
const rates = await prisma.monthlyRate.findMany({ where: { month } });
```

Thưởng và phạt của mọi nhân viên trong tháng:

```ts
const adjustments = await prisma.adjustment.groupBy({
  by: ["userId", "type"],
  where: { date: { gte: start, lt: end } },
  _sum: { amount: true },
});
```

Chi tiết từng ngày của một nhân viên (cho màn hình "Lương của tôi" và chi tiết bảng lương):

```ts
const days = await prisma.workEntry.findMany({
  where: { userId, workDate: { gte: start, lt: end } },
  include: { shift: true },
  orderBy: { workDate: "asc" },
});
```

Chép mức lương từ tháng trước sang tháng mới, không ghi đè dòng đã có:

```ts
const previous = await prisma.monthlyRate.findMany({ where: { month: prevMonth } });
await prisma.monthlyRate.createMany({
  data: previous.map((r) => ({
    userId: r.userId,
    month,
    morningRate: r.morningRate,
    afternoonRate: r.afternoonRate,
  })),
  skipDuplicates: true, // bỏ qua người đã có dòng của tháng này
});
```

Ghép kết quả ở `payroll/service.ts`: với mỗi nhân viên, lấy giờ sáng và giờ chiều từ `hours` (nhận ra ca nhờ `shiftId`), lấy mức từ `rates`, thưởng phạt từ `adjustments`, rồi gọi `calculatePay` theo công thức ở mục trên.

## Tóm tắt quy tắc

- Mức lương đổi theo tháng, không đổi giữa tháng.
- Ca chiều tính vào ngày bắt đầu ca, kể cả khi kết thúc sau nửa đêm.
- Tối đa hai dòng ca mỗi người mỗi ngày, và không có ngày vừa Off vừa có ca.
- Thưởng phạt tính vào tháng của ngày ghi nhận.
- Nhân viên nghỉ việc: `is_active = false`, không xóa dữ liệu.
- Mật khẩu luôn ở dạng băm.

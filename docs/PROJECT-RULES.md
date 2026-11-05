# PROJECT-RULES: Web tính lương Fight Station

Quy tắc viết code cho dự án. Dự án là **một ứng dụng Next.js duy nhất** (không tách BE/FE), nên file này gộp quy tắc backend và frontend. Đọc kèm `SPEC.md`, `DATABASE..md`, `ARCHITECTURE.md`, `API_SPEC.md`.

## Tech stack

- Ngôn ngữ: TypeScript (bật `strict`, không dùng `any`)
- Framework: Next.js 16 (App Router, Server Components, Server Actions)
- ORM: Prisma 6 với MySQL
- Xác thực: cookie JWT (`jose`), mật khẩu băm bằng `bcryptjs`
- Validation: `zod` (cài khi bắt đầu bước 3: `npm i zod`)
- Styling: Tailwind CSS 4
- Test: Vitest
- Không dùng thư viện state toàn cục. Dữ liệu lấy ở Server Component, form dùng `useActionState`.

## 1. Cấu trúc feature

```
src/features/<ten-feature>/
├── actions.ts        # Server Actions ("use server"): kiểm quyền, validate, gọi service
├── service.ts        # business logic
├── queries.ts        # chỉ truy cập Prisma (tầng dữ liệu)
├── schemas.ts        # zod schema cho dữ liệu vào
├── types.ts
├── utils.ts          # hàm thuần, không đụng DB
├── components/       # UI của feature
├── tests/
├── index.ts          # chỗ DUY NHẤT feature export ra ngoài
└── context.md        # 5-10 dòng: feature làm gì, bảng nào dùng
```

Feature của dự án: `auth`, `staff`, `shifts`, `rates`, `attendance`, `adjustments`, `payroll`, `me`.
Tạo file khi cần, không tạo file rỗng cho đủ bộ.

## 2. Quy ước đặt tên

| Thứ | Quy ước | Ví dụ |
| --- | --- | --- |
| Thư mục feature | kebab-case, số ít hoặc danh từ | `attendance` |
| File | kebab-case | `day-entries-form.tsx` |
| Component, type | PascalCase | `PayrollTable`, `MonthlyPayroll` |
| Hàm, biến | camelCase | `calculatePay` |
| Hằng số | UPPER_SNAKE_CASE | `SESSION_MAX_AGE_DAYS` |
| Server Action | động từ + danh từ | `saveDayEntries` |
| Bảng, cột DB | snake_case qua `@map` | `monthly_rates` |

## 3. Quy tắc cho feature

- Feature tự đóng gói. Chỉ import từ feature khác qua `index.ts` của nó.
- Không import vào file nội bộ của feature khác (`@/features/rates/queries` là **sai**, `@/features/rates` là đúng).
- Feature `payroll` được phép gọi hàm đọc dữ liệu của `rates`, `attendance`, `adjustments` qua `index.ts`. Các feature khác không gọi nhau.
- Code dùng chung đặt ở `src/lib/` (hạ tầng) và `src/shared/` (UI, tiện ích). Không đặt code nghiệp vụ ở đó.

## 4. Code pattern (BẮT BUỘC)

**Luồng một Server Action:** kiểm quyền → validate → gọi service → trả kết quả.

```ts
"use server";
export async function saveDayEntries(_prev: ActionResult | undefined, formData: FormData) {
  await requireOwner();                          // 1. kiểm quyền ở server
  const parsed = dayEntriesSchema.safeParse(...); // 2. validate
  if (!parsed.success) return fail("ATT_001", "Dữ liệu không hợp lệ", parsed.error.flatten());
  return ok(await saveEntries(parsed.data));     // 3. gọi service
}
```

- **Kết quả Server Action:** luôn là `{ success: true, data }` hoặc `{ success: false, error: { code, message, details } }`. Không throw cho lỗi nghiệp vụ.
- **Kiểm quyền:** mọi Server Action và mọi trang phải tự gọi `requireUser()` hoặc `requireOwner()`. Không dựa vào việc ẩn nút hay vào `proxy.ts`.
- **Tiền:** số nguyên đồng (`Int`). Không dùng số thực cho tiền. Làm tròn một lần ở cuối: `Math.round(hours * rate)`.
- **Giờ:** `Decimal(4,2)` trong DB, chuyển sang `number` khi tính.
- **Ngày và tháng:** ngày là `YYYY-MM-DD`, tháng là `YYYY-MM`, múi giờ `Asia/Ho_Chi_Minh`. Lọc theo tháng bằng khoảng `>= đầu tháng` và `< đầu tháng sau`.
- **Tính lương:** nằm trong một hàm thuần `calculatePay` ở `payroll/utils.ts`, có test. Không tính lương ở component hay ở trình duyệt.
- **Lỗi:** bắt lỗi Prisma ở `service`, đổi thành mã lỗi trong `API_SPEC.md`. Không để lộ thông báo lỗi DB ra giao diện.
- **Log:** `console.error` kèm mã lỗi và id người dùng. Không log mật khẩu, hash hay token.
- **Loading và lỗi UI:** dùng `useActionState` (`pending`), file `loading.tsx` và `error.tsx` cho route.

## 5. Anti-pattern (KHÔNG ĐƯỢC làm)

- Import vào file nội bộ của feature khác.
- Phụ thuộc vòng giữa các feature.
- Đặt business logic trong component hoặc trong `actions.ts` (chỉ gọi service).
- Gọi `prisma` ngoài `queries.ts` (trừ `prisma/seed.ts` và `src/lib/auth.ts`).
- Trả về lương của người khác cho nhân viên, kể cả trong dữ liệu truyền xuống client.
- Lưu hay in mật khẩu dạng chữ thường. Trả `passwordHash` ra khỏi server.
- Hardcode mức lương, giờ ca, chuỗi bí mật. Mức mặc định đọc từ bảng `shifts`.
- Tính lương bằng số thực rồi cộng dồn nhiều lần.
- Bật `cacheComponents` trong `next.config.ts`.
- Dùng `any`, `@ts-ignore` khi không có lý do ghi bằng comment.

## 6. Quy tắc cho component

- Mỗi file một component, tối đa khoảng 150 dòng. Dài hơn thì tách.
- Mặc định là Server Component. Chỉ thêm `"use client"` khi cần form tương tác, state hoặc sự kiện.
- Bắt buộc khai báo type cho props.
- Ưu tiên điện thoại: một cột, nút cao tối thiểu 40px, không cuộn ngang.
- Dùng class Tailwind. Không dùng inline style.

## 7. Git workflow

- Nhánh: `feat/<feature>-<mo-ta>`, `fix/<mo-ta>`, `chore/<mo-ta>`. Ví dụ `feat/rates-copy-month`.
- Commit: `<loai>(<feature>): <mo ta ngan>`. Ví dụ `feat(attendance): tự điền giờ mặc định khi tích ca`.
- PR: một feature hoặc một lỗi mỗi PR, kèm mô tả và cách kiểm tra. Build phải xanh.
- Không commit `.env`. `.env.example` thì được.

## 8. Testing

- Vitest. File test nằm trong `features/<feature>/tests/`, đặt tên `<ten>.test.ts`.
- **Bắt buộc test:** `calculatePay` (sáng, chiều, cả hai ca, ngày Off, thưởng, phạt, ca ngoài tháng), `copyRatesFromPreviousMonth`, kiểm tra quyền của Server Action.
- Phần giao diện không bắt buộc test ở giai đoạn này.
- Mỗi lỗi sửa xong phải có một test tái hiện lỗi đó.

## NÊN và KHÔNG NÊN

```ts
// NÊN: kiểm quyền rồi mới đọc dữ liệu
const user = await requireUser();
const payroll = await getMyPayroll(user.id, month);

// KHÔNG NÊN: nhận userId từ client rồi tin luôn
export async function getPayroll(userId: number, month: string) { ... }
```

```ts
// NÊN: số nguyên đồng, làm tròn một lần
const pay = Math.round(hours * rate);

// KHÔNG NÊN: cộng dồn số thực
total += hours * rate * 1.0;
```

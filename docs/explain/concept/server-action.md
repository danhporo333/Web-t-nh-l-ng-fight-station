# Giải thích concept: Server Action

- **Chế độ:** concept
- **Target:** Server Action
- **Ngày viết:** 2026-11-12
- **Tài liệu đã đọc:** `docs/PROJECT-RULES.md`, `docs/ARCHITECTURE.md` (mục 3, 4, 8), `node_modules/next/dist/docs/01-app/02-guides/server-actions.md`

## 🎯 Server Action

### Là gì?
Server Action là một hàm chạy **trên server**, nhưng được gọi từ giao diện như một hàm bình thường, thường qua `<form action={...}>`. Bạn đánh dấu file bằng `"use server"`, và Next.js tự lo phần gửi request lên server.

Trong dự án này, **Server Component đọc dữ liệu, Server Action ghi dữ liệu**. Vì vậy không cần dựng API riêng.

### Ví dụ đời thường
Server Action giống **quầy nhân viên** trong quán:
- Bạn (trình duyệt) không tự vào sổ chấm công để sửa.
- Bạn đưa phiếu cho nhân viên quầy (Server Action).
- Nhân viên kiểm tra bạn có quyền không, kiểm tra phiếu có hợp lệ không, rồi mới ghi sổ và báo lại kết quả.

### Trong code
Mẫu bắt buộc của dự án, theo `PROJECT-RULES.md` mục 4. Luồng là kiểm quyền → validate → gọi service → trả kết quả:

```ts
"use server";
export async function saveDayEntries(_prev: ActionResult | undefined, formData: FormData) {
  await requireOwner();                           // 1. kiểm quyền ở server
  const parsed = dayEntriesSchema.safeParse(...);  // 2. validate bằng zod
  if (!parsed.success) return fail("ATT_001", "Dữ liệu không hợp lệ", parsed.error.flatten());
  return ok(await saveEntries(parsed.data));      // 3. gọi service
}
```

Kết quả luôn có một trong hai dạng:
- `{ success: true, data }`
- `{ success: false, error: { code, message, details } }`

Lỗi nghiệp vụ được **trả về**, không `throw`.

### Trong dự án này
- Mỗi feature có file `actions.ts`, ví dụ `src/features/auth/actions.ts` (`login`, `logout`, `changePassword`) và `saveDayEntries` của `attendance`.
- `actions.ts` chỉ làm 3 việc: kiểm quyền, validate, gọi service. **Không** đặt business logic hay gọi Prisma ở đây.
- Form phía giao diện dùng `useActionState` để lấy kết quả và trạng thái đang gửi (`pending`).
- Sau khi ghi xong, gọi `revalidatePath` cho trang liên quan để dữ liệu mới hiện ngay.

### Tại sao cần?
- Không phải viết API route và `fetch` riêng, nên ít code hơn và dễ triển khai lên Vercel.
- Dữ liệu và logic nhạy cảm (tính lương, bcrypt, Prisma) luôn nằm ở server, không lộ xuống trình duyệt.
- Với `revalidatePath`, `redirect` hoặc thay đổi cookie, Next.js trả lại cả kết quả lẫn trang đã render lại **trong một lần gọi**, nên không cần tải lại thủ công.

### Phải nhớ về bảo mật
Theo tài liệu Next.js 16, một Server Action thực chất là một **POST endpoint**. Bất kỳ ai gửi được request đó đều gọi được, kể cả khi bạn không vẽ nút trên giao diện. Vì vậy:
- **Luôn kiểm quyền trong từng action** bằng `requireUser()` hoặc `requireOwner()`. Ẩn nút, hay `proxy.ts` chỉ kiểm tra có cookie, đều không đủ.
- **Validate mọi đầu vào**, vì `FormData` là dữ liệu không tin cậy được.
- **Chỉ trả về đúng thứ giao diện cần**, không trả record thô. Ví dụ không bao giờ trả `passwordHash` hay lương của người khác.
- Không nhận `userId` từ client rồi tin luôn. Hãy lấy `userId` từ session, như hàm đọc lương của feature `me`.
- Next.js có sẵn kiểm tra CSRF (so `Origin` với `Host`) và giới hạn body 1MB, nhưng các lớp này không thay thế cho kiểm quyền của ứng dụng.

### Không dùng pattern này thì sao?
- Quên `requireOwner()` thì nhân viên có thể tự gọi action và sửa chấm công.
- Để logic trong `actions.ts` hoặc component thì khó test (đặc biệt `calculatePay`) và dễ lệch giữa các nơi.
- Dùng `throw` cho lỗi nghiệp vụ thì giao diện khó hiển thị lỗi theo mã `API_SPEC.md`.

### Lưu ý nhỏ
- Next.js gửi các Server Action **lần lượt từng cái** từ một client, nên đừng trông chờ `Promise.all` để chạy song song.
- `redirect` hoạt động bằng cách ném một ngoại lệ điều khiển luồng, nên code viết sau nó sẽ không chạy. Hãy gọi `revalidatePath` trước `redirect`.

### 📚 Tìm hiểu thêm
- Từ khóa: `"use server"`, `useActionState`, `revalidatePath`, `redirect`, `FormData`
- Tài liệu: `docs/PROJECT-RULES.md` mục 4 và 5, `docs/ARCHITECTURE.md` mục 4 và 8, `docs/API_SPEC.md` (kết quả và mã lỗi), `node_modules/next/dist/docs/01-app/02-guides/server-actions.md`

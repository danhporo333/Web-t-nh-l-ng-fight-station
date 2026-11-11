# Fight Station - Web Tính Lương Nhân Viên

Web ứng dụng tính lương theo giờ, theo ca cho nhân viên quán Fight Station. Chủ quán có thể quản lý nhân viên, cài đặt mức lương, chấm công, thưởng phạt và xem bảng lương của tất cả mọi người. Nhân viên đăng nhập chỉ để xem bảng lương của chính mình.

## 🎯 Tính năng chính

### Chủ quán (OWNER)
- 👥 **Quản lý nhân viên**: thêm, sửa, khóa tài khoản
- 💰 **Mức lương**: cài đặt mức lương theo ca (sáng/chiều) cho từng nhân viên, từng tháng. Tự động chép mức từ tháng trước.
- 📋 **Chấm công**: ghi nhận ngày làm, giờ làm, ngày Off, đánh dấu ngày lễ (lương nhân đôi)
- 🎁 **Thưởng và phạt**: thêm khoản thưởng, phạt hoặc tiền ăn uống cho nhân viên
- 📊 **Bảng lương**: xem tổng lương tháng của mọi người (lương ca + thưởng - phạt - ăn uống)
- 📈 **Thống kê**: xem số ngày Off, lỗi và phạt theo người
- ⚙️ **Cài đặt ca**: tuỳ chỉnh giờ ca sáng/chiều và mức mặc định

### Nhân viên (STAFF)
- 👤 **Xem lương cá nhân**: xem bảng lương tháng của chính mình (kèm chi tiết từng khoản thưởng/phạt)
- 🔑 **Đổi mật khẩu**: tuỳ chỉnh mật khẩu của mình

## 🛠️ Công nghệ

- **Frontend + Backend**: [Next.js 16.4.5](https://nextjs.org) với React 19, Server Components, Server Actions
- **Styling**: Tailwind CSS 4 + Turbopack
- **Database**: [Prisma 6](https://www.prisma.io) + MySQL (cloud)
- **Auth**: JWT (httpOnly cookie, 7 ngày)
- **Hosting**: [Vercel](https://vercel.com)
- **Progressive Web App (PWA)**: Cài trên màn hình chính (Android + iPhone)

## 📦 Yêu cầu

- Node.js >= 24.0
- npm >= 11.0
- MySQL cloud (ví dụ PlanetScale, Railway, AWS RDS)

## 🚀 Cài đặt

### 1. Clone repo và cài dependencies

```bash
git clone <repo-url>
cd "Web tính lương Fight"
npm install
```

### 2. Cấu hình biến môi trường

Sao chép `.env.example` thành `.env`:

```bash
cp .env.example .env
```

Điền giá trị thật vào `.env`:

```env
DATABASE_URL="mysql://user:password@host:port/database"
SESSION_SECRET="<chuỗi ngẫu nhiên 32+ ký tự>"
OWNER_USERNAME="<tên đăng nhập chủ quán>"
OWNER_PASSWORD="<mật khẩu chủ quán>"
```

> ⚠️ **Không** đưa `.env` lên Git. Chỉ `.env.example` được commit.

### 3. Tạo bảng và seed dữ liệu

```bash
# Tạo bảng trong MySQL theo schema
npm run db:push

# Tạo tài khoản chủ quán và hai ca mặc định
npm run db:seed
```

## 🏃 Chạy ứng dụng

### Môi trường phát triển (development)

```bash
npm run dev
```

Truy cập http://localhost:3000 và đăng nhập bằng tài khoản chủ quán.

### Kiểm tra trước khi đưa lên production

```bash
npm run lint    # Kiểm tra style code
npm run build   # Build production
npm start       # Chạy production build
```

## 📱 Progressive Web App (PWA)

App hỗ trợ cài đặt trên màn hình chính:

### Android (Chrome)
1. Vào app trên Vercel
2. Chrome sẽ gợi ý "Cài đặt ứng dụng"
3. Bấm "Cài đặt" → app xuất hiện trên home screen
4. Icon: Fight Station logo (gamepad cam + chữ)

### iPhone (Safari)
1. Mở Safari, vào app trên Vercel
2. Bấm nút Chia sẻ (vuông mũi tên ở dưới)
3. Cuộn xuống chọn "Thêm vào Màn hình chính"
4. Nhập tên, bấm "Thêm"
5. App sẽ xuất hiện trên home screen với icon apple-icon.png

## 📁 Cấu trúc thư mục

```
.
├── prisma/                    # Schema Prisma, seed
│   ├── schema.prisma          # 5 bảng (users, shifts, monthly_rates, work_entries, adjustments)
│   └── seed.ts                # Dữ liệu mặc định
├── src/
│   ├── app/                   # Routes và layout
│   │   ├── layout.tsx         # Root layout (HTML, metadata)
│   │   ├── manifest.ts        # Web app manifest (PWA)
│   │   ├── page.tsx           # Trang chủ (chuyển hướng theo vai trò)
│   │   ├── login/             # Đăng nhập
│   │   ├── admin/             # Chủ quán
│   │   │   ├── staff/         # Quản lý nhân viên
│   │   │   ├── rates/         # Mức lương
│   │   │   ├── attendance/    # Chấm công
│   │   │   ├── adjustments/   # Thưởng phạt
│   │   │   ├── payroll/       # Bảng lương
│   │   │   ├── shifts/        # Cài đặt ca
│   │   │   └── stats/         # Thống kê
│   │   ├── me/                # Lương cá nhân
│   │   └── change-password/   # Đổi mật khẩu
│   ├── features/              # Business logic từng feature
│   │   ├── auth/
│   │   ├── staff/
│   │   ├── shifts/
│   │   ├── rates/
│   │   ├── attendance/
│   │   ├── adjustments/
│   │   ├── payroll/
│   │   ├── stats/
│   │   └── me/
│   ├── lib/                   # Hạ tầng dùng chung
│   │   ├── prisma.ts          # PrismaClient
│   │   ├── session.ts         # JWT cookie
│   │   ├── auth.ts            # requireUser(), requireOwner()
│   │   └── result.ts          # ActionResult type
│   └── shared/                # UI components và utilities
│       ├── components/        # Header, Button, Form, ...
│       └── utils/             # formatMoney(), formatDate(), ...
├── docs/                      # Tài liệu (đọc kỹ trước khi code)
│   ├── SPEC.md                # Yêu cầu, quy tắc lương
│   ├── DATABASE..md           # Schema chi tiết, truy vấn mẫu
│   ├── PROJECT-RULES.md       # Quy ước, pattern, anti-pattern
│   ├── ARCHITECTURE.md        # Cấu trúc, luồng request, route
│   ├── API_SPEC.md            # Server Action, mã lỗi
│   └── SETUP-NOTES.md         # Ghi chú setup
├── public/                    # Asset tĩnh
│   ├── icon-*.png             # Icon PWA
│   ├── apple-icon.png         # Icon iPhone
│   ├── favicon.ico            # Favicon
│   └── fight-station.png      # Logo Fight Station
├── proxy.ts                   # Middleware (kiểm tra auth)
├── CLAUDE.md                  # Hướng dẫn cho Claude
└── README.md                  # File này
```

## 🔐 Đăng nhập

**Tài khoản chủ quán:**
- Tên: `OWNER_USERNAME` (từ `.env`)
- Mật khẩu: `OWNER_PASSWORD` (từ `.env`)
- Vai trò: OWNER (quản lý toàn bộ)

**Tài khoản nhân viên:**
- Do chủ quán tạo ở trang "Quản lý nhân viên"
- Vai trò: STAFF (chỉ xem lương cá nhân)

Mật khẩu được băm bằng bcryptjs, lưu trong MySQL.

## 💡 Quy tắc tính lương

### Lương cơ bản

Với mỗi nhân viên, từng tháng:

```
Lương ca sáng   = tổng giờ ca sáng   × mức ca sáng
Lương ca chiều  = tổng giờ ca chiều  × mức ca chiều
Tổng lương ca   = Lương ca sáng + Lương ca chiều
Thực lãnh       = Tổng lương ca + Thưởng − Phạt − Ăn uống
```

### Ca làm việc

| Ca | Giờ | Giờ mặc định | Mức mặc định |
| --- | --- | --- | --- |
| Ca sáng | 07:30 – 16:00 | 8,5 giờ | 24.000 đ/giờ |
| Ca chiều | 16:00 – 02:00 (hôm sau) | 10 giờ | 26.000 đ/giờ |

### Lưu ý đặc biệt

- **Mức lương theo tháng**: chỉ thay đổi khi sang tháng mới, không tăng giữa tháng
- **Tự động chép mức**: khi mở màn hình Chấm công/Mức lương/Bảng lương của tháng mới, hệ thống tự chép mức từ tháng trước
- **Ngày Off**: không tính lương
- **Ngày lễ**: lương ca nhân đôi (chỉ lương ca, không ảnh hưởng thưởng/phạt)
- **Ca chiều tính vào ngày bắt đầu**: ca chiều 31/10 kết thúc 01/11 vẫn tính vào lương tháng 10
- **Hai ca trong một ngày**: một nhân viên có thể làm cả hai ca, lương được cộng

## 🧪 Thử nghiệm

```bash
npm test        # Chạy Vitest
npm run lint    # Kiểm tra ESLint
```

## 🚢 Triển khai lên Vercel

### Lần đầu tiên

1. Đẩy code lên GitHub
2. Trên Vercel, chọn repo này để import
3. Thiết lập biến môi trường (Environment Variables):
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `OWNER_USERNAME`
   - `OWNER_PASSWORD`
4. Deploy
5. Sau khi deployed thành công, chạy Prisma commands (nếu cần):
   ```bash
   npx prisma db push
   npm run db:seed
   ```

### Các lần sau

Chỉ cần push code lên GitHub, Vercel tự deploy.

## 📖 Tài liệu chi tiết

| Cần tìm | Đọc file |
| --- | --- |
| Yêu cầu, quy tắc lương, màn hình | [docs/SPEC.md](docs/SPEC.md) |
| Schema, cột, ràng buộc, truy vấn | [docs/DATABASE..md](docs/DATABASE..md) |
| Quy ước code, pattern, Git | [docs/PROJECT-RULES.md](docs/PROJECT-RULES.md) |
| Cấu trúc thư mục, route, triển khai | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Server Action, mã lỗi | [docs/API_SPEC.md](docs/API_SPEC.md) |
| Ghi chú setup | [docs/SETUP-NOTES.md](docs/SETUP-NOTES.md) |

## 🤝 Đóng góp

Trước khi làm việc trên feature mới:

1. Đọc kỹ [CLAUDE.md](CLAUDE.md) (hướng dẫn cho Claude)
2. Đọc docs liên quan (SPEC, ARCHITECTURE, PROJECT-RULES)
3. Tạo branch: `git checkout -b <tên-feature>`
4. Commit: `git commit -m "<loại>(<phạm vi>): <mô tả>"` (tiếng Việt)
5. Push và tạo Pull Request

Commit message phải tiếng Việt. Chi tiết xem [docs/PROJECT-RULES.md](docs/PROJECT-RULES.md).

## 📞 Liên hệ

Nếu có câu hỏi hoặc vấn đề, liên hệ:
- Email: danhzxc555@gmail.com
- Issues: [GitHub Issues](#)

## 📄 Giấy phép

[MIT License](LICENSE)

---

**Made with ❤️ for Fight Station**

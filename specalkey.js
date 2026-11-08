// Tạo chuỗi ngẫu nhiên an toàn để dùng cho SESSION_SECRET
// Chạy: node specalkey.js
const { randomBytes } = require("crypto");

// 32 byte ngẫu nhiên -> 64 ký tự hex (đủ yêu cầu tối thiểu 32 ký tự)
const secret = randomBytes(32).toString("hex");

console.log(secret);

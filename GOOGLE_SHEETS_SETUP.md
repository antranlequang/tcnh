# Hướng dẫn cấu hình Google Sheets API

## Bước 1: Tạo Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Bật Google Sheets API:
   - Vào "APIs & Services" > "Library"
   - Tìm "Google Sheets API" và bật

## Bước 2: Tạo Service Account

1. Vào "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Điền thông tin service account:
   - Name: `sheets-api-service`
   - Description: `Service account for Google Sheets integration`
4. Click "Create and Continue"
5. Bỏ qua phần "Grant this service account access to project"
6. Click "Done"

## Bước 3: Tạo và tải Key

1. Click vào service account vừa tạo
2. Vào tab "Keys"
3. Click "Add Key" > "Create new key"
4. Chọn "JSON"
5. Tải file JSON về máy
6. Đặt tên file là `service-account-key.json` và đặt trong thư mục gốc của project

## Bước 4: Chia sẻ Google Sheet

1. Mở Google Sheet bạn muốn sử dụng
2. Click "Share" (góc trên bên phải)
3. Thêm email của service account (có trong file JSON) với quyền "Editor"
4. Copy Sheet ID từ URL (phần giữa `/d/` và `/edit`)

## Bước 5: Cấu hình Environment Variables

Tạo file `.env.local` trong thư mục gốc của project (chọn một phương thức cung cấp credentials):

```bash
# Google Sheets API Configuration
GOOGLE_SHEET_ID=your_google_sheet_id_here
GOOGLE_SHEET_RANGE=Sheet1!A:I
GOOGLE_SHEET_RANGE_CONTACT=Contact!A:D

# Cách 1 (khuyến nghị prod): base64 toàn bộ JSON
GOOGLE_SERVICE_ACCOUNT_JSON_BASE64=

# Cách 2: ENV từng biến
# GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
# GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Cách 3: File JSON local
GOOGLE_SERVICE_ACCOUNT_KEY_FILE=./service-account-key.json
```

## Bước 6: Cấu trúc Google Sheet

### Sheet cho Application Form (Sheet1):
| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| Timestamp | Họ và Tên | Email | Số điện thoại | Facebook Link | Lý do ứng tuyển | Kỳ vọng | Tình huống | Ban chuyên môn |

### Sheet cho Contact Form (Contact):
| A | B | C | D |
|---|---|---|---|
| Timestamp | Tên | Email | Tin nhắn |

## Bước 7: Kiểm tra

1. Chạy `npm run dev`
2. Điền form và submit
3. Kiểm tra Google Sheet xem dữ liệu đã được ghi chưa

## Lưu ý bảo mật

- **KHÔNG** commit file `service-account-key.json` vào git
- **KHÔNG** commit file `.env.local` vào git
- Sử dụng `.gitignore` để loại trừ các file nhạy cảm
- Trong production, sử dụng environment variables của hosting platform

## Troubleshooting

### Lỗi "Invalid private key" hoặc "invalid_grant: Invalid JWT Signature"
- Private key trong ENV thiếu newline đúng chuẩn. Ưu tiên dùng `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64`.
- Nếu dùng `GOOGLE_PRIVATE_KEY`, thay newline bằng `\n` và đảm bảo có newline kết thúc.
- Đảm bảo `client_email` và `private_key` thuộc cùng một service account.

### Lỗi "Permission denied"
- Kiểm tra quyền của service account trong Google Sheet
- Đảm bảo đã share sheet với email của service account

### Lỗi "API not enabled"
- Kiểm tra Google Sheets API đã được bật trong Google Cloud Console

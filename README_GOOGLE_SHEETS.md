# Tích hợp Google Sheets API cho Form

## Tổng quan

Dự án đã được tích hợp Google Sheets API để tự động ghi dữ liệu từ các form vào Google Sheet. Hiện tại hỗ trợ:

1. **Application Form** - Form ứng tuyển vào Đoàn khoa
2. **Contact Form** - Form liên hệ

## Tính năng đã thêm

### 1. Tự động ghi dữ liệu vào Google Sheet
- Khi user submit form, dữ liệu sẽ tự động được ghi vào Google Sheet
- Mỗi form submission tạo một row mới trong sheet
- Timestamp được tự động thêm vào

### 2. Cấu trúc dữ liệu trong Google Sheet

#### Sheet cho Application Form (Sheet1):
| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| Timestamp | Họ và Tên | Email | Số điện thoại | Facebook Link | Lý do ứng tuyển | Kỳ vọng | Tình huống | Ban chuyên môn |

#### Sheet cho Contact Form (Contact):
| A | B | C | D |
|---|---|---|---|
| Timestamp | Tên | Email | Tin nhắn |

### 3. Trang test và debug
- `/test-sheets` - Trang test Google Sheets API
- `/api/sheets/test` - API endpoint để test kết nối

## Cài đặt và cấu hình

### Bước 1: Cài đặt dependencies
```bash
npm install googleapis
npm install --save-dev @types/google-apps-script
```

### Bước 2: Tạo Google Cloud Project
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Bật Google Sheets API

### Bước 3: Tạo Service Account
1. Vào "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Tạo key JSON và tải về
4. Đặt tên file là `service-account-key.json` trong thư mục gốc

### Bước 4: Chia sẻ Google Sheet
1. Mở Google Sheet bạn muốn sử dụng
2. Share với email của service account (có trong file JSON)
3. Copy Sheet ID từ URL

### Bước 5: Cấu hình Environment Variables
Tạo file `.env.local` (chọn MỘT trong các cách cung cấp credentials dưới đây):
```bash
# Thông tin Google Sheet
GOOGLE_SHEET_ID=your_google_sheet_id_here
GOOGLE_SHEET_RANGE=Sheet1!A:I
GOOGLE_SHEET_RANGE_CONTACT=Contact!A:D

# Cách 1 (Khuyến nghị production): Base64 toàn bộ JSON credentials
# Tạo chuỗi base64: base64 -i service-account-key.json | tr -d '\n'
GOOGLE_SERVICE_ACCOUNT_JSON_BASE64=

# Cách 2: ENV từng biến (cẩn thận xuống dòng private key)
# GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
# GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Cách 3: Dùng file JSON local (phù hợp dev local)
GOOGLE_SERVICE_ACCOUNT_KEY_FILE=./service-account-key.json
```

## Sử dụng

### 1. Form ứng tuyển
- Truy cập `/apply`
- Điền form và submit
- Dữ liệu sẽ tự động được ghi vào Google Sheet

### 2. Form liên hệ
- Sử dụng ContactForm component
- Dữ liệu sẽ được ghi vào sheet "Contact"

### 3. Test API
- Truy cập `/test-sheets` để test kết nối
- Sử dụng nút "Đọc dữ liệu từ Google Sheet" để kiểm tra

## Cấu trúc code

### Files chính:
- `src/lib/google-sheets.ts` - Logic tích hợp Google Sheets API
- `src/app/actions.ts` - Server actions xử lý form
- `src/components/shared/GoogleSheetsTest.tsx` - Component test
- `src/app/test-sheets/page.tsx` - Trang test
- `src/app/api/sheets/test/route.ts` - API endpoint test

### Functions chính:
- `appendApplicationToSheet()` - Ghi dữ liệu application form
- `appendContactToSheet()` - Ghi dữ liệu contact form
- `getSheetData()` - Đọc dữ liệu từ sheet

## Bảo mật

### Files cần bảo vệ:
- `service-account-key.json` - Chứa private key
- `.env.local` - Chứa environment variables

### Đã được bảo vệ:
- `.gitignore` đã loại trừ các file nhạy cảm
- Service account chỉ có quyền truy cập Google Sheets

## Troubleshooting

### Lỗi thường gặp:

1. **"GOOGLE_SHEET_ID environment variable is not set"**
   - Kiểm tra file `.env.local`
   - Đảm bảo biến `GOOGLE_SHEET_ID` đã được set

2. **"Invalid private key" / "invalid_grant: Invalid JWT Signature"**
   - Private key trong ENV thiếu xuống dòng chuẩn. Khắc phục:
     - Ưu tiên dùng `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64`, hoặc
     - Với `GOOGLE_PRIVATE_KEY`, thay newline bằng `\n` và đảm bảo có newline cuối cùng
   - Đảm bảo `client_email` khớp đúng với `private_key` (không trộn 2 service account)
   - Nếu set ENV trên dashboard hosting, không bọc giá trị trong dấu nháy

3. **"Permission denied"**
   - Kiểm tra quyền của service account trong Google Sheet
   - Đảm bảo đã share sheet với email của service account

4. **"API not enabled"**
   - Kiểm tra Google Sheets API đã được bật trong Google Cloud Console

### Debug:
- Sử dụng trang `/test-sheets` để test kết nối
- Kiểm tra console logs trong terminal
- Kiểm tra Network tab trong browser DevTools

## Production Deployment

### Environment Variables:
- Sử dụng environment variables của hosting platform
- Không hardcode credentials trong code

### Service Account:
- Tạo service account riêng cho production
- Giới hạn quyền truy cập chỉ vào Google Sheets cần thiết

## Tương lai

### Tính năng có thể thêm:
- Export dữ liệu từ Google Sheet
- Dashboard quản lý applications
- Email notifications khi có form mới
- Backup dữ liệu tự động
- Analytics và báo cáo

### Cải tiến:
- Batch processing cho nhiều records
- Error handling tốt hơn
- Retry mechanism cho failed requests
- Rate limiting để tránh quota limits

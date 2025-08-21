import { GoogleSheetsTest } from '@/components/shared/GoogleSheetsTest';

export default function TestSheetsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Test Google Sheets API
          </h1>
          <p className="text-gray-600">
            Trang này giúp bạn kiểm tra kết nối với Google Sheets API
          </p>
        </div>
        
        <GoogleSheetsTest />
        
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">
            Hướng dẫn sử dụng
          </h2>
          <div className="text-blue-800 space-y-2">
            <p>1. Đảm bảo đã cấu hình đúng environment variables</p>
            <p>2. Đặt file service-account-key.json trong thư mục gốc</p>
            <p>3. Share Google Sheet với service account</p>
            <p>4. Click nút "Đọc dữ liệu từ Google Sheet" để test</p>
          </div>
        </div>
      </div>
    </div>
  );
}

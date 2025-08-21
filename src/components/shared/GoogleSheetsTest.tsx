"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';


export function GoogleSheetsTest() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testReadFromSheet = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/sheets/test');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Google Sheets API Test</CardTitle>
        <CardDescription>
          Test component để kiểm tra kết nối với Google Sheets
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={testReadFromSheet} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Đang đọc...' : 'Đọc dữ liệu từ Google Sheet'}
        </Button>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 font-medium">Lỗi:</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {data.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Dữ liệu từ Sheet:</h3>
            <div className="max-h-96 overflow-auto border rounded-md p-4 bg-gray-50">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Lưu ý:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Đảm bảo đã cấu hình đúng environment variables</li>
            <li>Service account key file phải được đặt trong thư mục gốc</li>
            <li>Google Sheet phải được share với service account</li>
            <li>Google Sheets API phải được bật trong Google Cloud Console</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

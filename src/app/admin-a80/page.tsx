"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Eye, EyeOff } from 'lucide-react';

export default function AdminA80() {
  const [showData, setShowData] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadComments = () => {
    const savedComments = localStorage.getItem('a80-comments');
    if (savedComments) {
      const data = JSON.parse(savedComments);
      setComments(data);
      setShowData(true);
    } else {
      alert('Không có dữ liệu để hiển thị');
    }
  };

  const exportToExcel = async () => {
    try {
      setIsLoading(true);
      const savedComments = localStorage.getItem('a80-comments');
      
      if (!savedComments) {
        alert('Không có dữ liệu để xuất');
        return;
      }

      const comments = JSON.parse(savedComments);
      
      const response = await fetch('/api/a80-export?key=admin-export-2024', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comments }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `a80-comments-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      alert('Xuất file Excel thành công!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Có lỗi xảy ra khi xuất file');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">A80 Data Management</h1>
            <p className="text-gray-600">Admin panel for A80 comments data</p>
            <div className="w-16 h-1 bg-red-500 mx-auto mt-4"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Eye className="mr-2 h-5 w-5 text-blue-500" />
                  View Data
                </h3>
                <p className="text-gray-600 mb-4">View all submitted comments from localStorage</p>
                <Button onClick={loadComments} className="w-full">
                  {showData ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                  {showData ? 'Hide Data' : 'Show Data'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Download className="mr-2 h-5 w-5 text-green-500" />
                  Export to Excel
                </h3>
                <p className="text-gray-600 mb-4">Download all comments as an Excel file</p>
                <Button 
                  onClick={exportToExcel} 
                  disabled={isLoading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isLoading ? 'Exporting...' : 'Export Excel'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {showData && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Comments Data ({comments.length} entries)</h2>
                <Button variant="outline" onClick={() => setShowData(false)}>
                  <EyeOff className="mr-2 h-4 w-4" />
                  Hide
                </Button>
              </div>

              <div className="bg-gray-100 rounded-lg p-4 max-h-96 overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No comments found</p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment, index) => (
                      <div key={comment.id || index} className="bg-white rounded-lg p-4 border">
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Name:</strong> {comment.name}
                          </div>
                          <div>
                            <strong>Student ID:</strong> {comment.studentId || 'N/A'}
                          </div>
                          <div>
                            <strong>Email:</strong> {comment.email || 'N/A'}
                          </div>
                          <div>
                            <strong>Faculty:</strong> {comment.faculty || 'N/A'}
                          </div>
                          <div>
                            <strong>Class:</strong> {comment.className || 'N/A'}
                          </div>
                          <div>
                            <strong>Date:</strong> {new Date(comment.timestamp).toLocaleString('vi-VN')}
                          </div>
                        </div>
                        <div className="mt-3">
                          <strong>Content:</strong>
                          <p className="mt-1 text-gray-700 bg-gray-50 p-2 rounded">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Admin Access Instructions</h3>
            <p className="text-yellow-700 text-sm">
              This page is hidden and only accessible via direct URL: <code>/admin-a80</code>
              <br />
              Data is currently stored in localStorage. For production, consider using a database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
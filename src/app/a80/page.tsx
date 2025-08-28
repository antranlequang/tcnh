"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { X, MessageSquare, Upload, Flag } from 'lucide-react';

interface Submission {
  id: string;
  name: string;
  studentId?: string;
  className?: string;
  faculty?: string;
  email?: string;
  content: string;
  image?: string;
  isAnonymous: boolean;
  createdAt: string;
}

interface FormData {
  name: string;
  studentId: string;
  className: string;
  faculty: string;
  email: string;
  content: string;
  image: File | null;
  isAnonymous: boolean;
}

export default function A80Page() {
  const [showPopup, setShowPopup] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    studentId: '',
    className: '',
    faculty: '',
    email: '',
    content: '',
    image: null,
    isAnonymous: false
  });

  const flagCanvasRef = useRef<HTMLCanvasElement>(null);

  // Vietnamese flag dimensions and colors
  const FLAG_RATIO = 3 / 2; // width:height = 3:2
  const STAR_POINTS = 5;
  const RED_COLOR = '#DA251D';
  const YELLOW_COLOR = '#FFD700';

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    if (submissions.length > 0) {
      drawVietnameseFlag();
    }
  }, [submissions]);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/a80/submissions');
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        image: e.target.files![0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.content.trim()) {
      alert('Tên và nội dung là bắt buộc!');
      return;
    }

    setIsLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.isAnonymous ? 'Ẩn danh' : formData.name);
      submitData.append('studentId', formData.studentId);
      submitData.append('className', formData.className);
      submitData.append('faculty', formData.faculty);
      submitData.append('email', formData.email);
      submitData.append('content', formData.content);
      submitData.append('isAnonymous', formData.isAnonymous.toString());
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      const response = await fetch('/api/a80/submissions', {
        method: 'POST',
        body: submitData,
      });

      if (response.ok) {
        setFormData({
          name: '',
          studentId: '',
          className: '',
          faculty: '',
          email: '',
          content: '',
          image: null,
          isAnonymous: false
        });
        setShowPopup(false);
        fetchSubmissions();
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      alert('Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  const drawVietnameseFlag = () => {
    const canvas = flagCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Fill background with red
    ctx.fillStyle = RED_COLOR;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Calculate pixel size based on submissions count
    const targetPixels = 1000;
    const currentSubmissions = submissions.length;
    
    let pixelSize: number;
    let cols: number;
    let rows: number;

    if (currentSubmissions <= targetPixels) {
      // Calculate optimal pixel size for clear flag visibility
      pixelSize = Math.max(2, Math.min(8, Math.floor(Math.sqrt(canvasWidth * canvasHeight / targetPixels))));
      cols = Math.floor(canvasWidth / pixelSize);
      rows = Math.floor(canvasHeight / pixelSize);
    } else {
      // Scale down pixel size to fit all submissions
      const totalPixels = currentSubmissions;
      pixelSize = Math.max(1, Math.floor(Math.sqrt(canvasWidth * canvasHeight / totalPixels)));
      cols = Math.floor(canvasWidth / pixelSize);
      rows = Math.floor(canvasHeight / pixelSize);
    }

    // Draw star outline (approximate positions where pixels should be yellow)
    const centerX = cols / 2;
    const centerY = rows / 2;
    const starRadius = Math.min(cols, rows) * 0.15;

    // Create star shape mask
    const starPixels = new Set<string>();
    for (let angle = 0; angle < Math.PI * 2; angle += 0.01) {
      const starX = centerX + Math.cos(angle - Math.PI / 2) * starRadius;
      const starY = centerY + Math.sin(angle - Math.PI / 2) * starRadius;
      
      // Add some thickness to the star
      for (let dx = -2; dx <= 2; dx++) {
        for (let dy = -2; dy <= 2; dy++) {
          const px = Math.floor(starX + dx);
          const py = Math.floor(starY + dy);
          if (px >= 0 && px < cols && py >= 0 && py < rows) {
            starPixels.add(`${px},${py}`);
          }
        }
      }
    }

    // Draw 5-pointed star
    const drawStar = (cx: number, cy: number, radius: number) => {
      ctx.beginPath();
      for (let i = 0; i < STAR_POINTS * 2; i++) {
        const angle = (i * Math.PI) / STAR_POINTS - Math.PI / 2;
        const r = i % 2 === 0 ? radius : radius * 0.4;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fillStyle = YELLOW_COLOR;
      ctx.fill();
    };

    // Draw the main star
    drawStar(canvasWidth / 2, canvasHeight / 2, Math.min(canvasWidth, canvasHeight) * 0.15);

    // Draw submission pixels over the flag
    submissions.forEach((submission, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      
      if (row < rows) {
        const x = col * pixelSize;
        const y = row * pixelSize;
        
        // Create a subtle overlay effect
        ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + (index % 3) * 0.1})`;
        ctx.fillRect(x, y, pixelSize - 1, pixelSize - 1);
        
        // Add a tiny dot to represent each submission
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(x + pixelSize / 2 - 0.5, y + pixelSize / 2 - 0.5, 1, 1);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 relative">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-red-600 mb-2 flex items-center justify-center gap-2">
          <Flag className="w-8 h-8" />
          Gửi lời chúc đến Hà Nội
        </h1>
        <p className="text-gray-600">
          Hãy gửi lời chúc của bạn để cùng tạo nên lá cờ Việt Nam! ({submissions.length}/1000 tin nhắn)
        </p>
      </div>

      {/* Main Display Area - Vietnamese Flag */}
      <div className="container mx-auto px-4 mb-8">
        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-6">
            <div className="relative w-full h-[400px] border-4 border-red-200 rounded-lg overflow-hidden">
              <canvas
                ref={flagCanvasRef}
                width={800}
                height={533} // 3:2 ratio
                className="w-full h-full object-contain"
              />
              <div className="absolute top-4 right-4 bg-white/90 px-3 py-2 rounded-lg text-sm font-semibold text-red-600">
                {submissions.length} / 1000 pixels
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <div className="container mx-auto px-4 mb-8">
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Gửi lời chúc của bạn ngay!</h2>
            <p className="text-red-100 mb-6">
              Mỗi tin nhắn sẽ trở thành một pixel tạo nên lá cờ Việt Nam. Hãy góp phần hoàn thành lá cờ thiêng liêng!
            </p>
            <Button 
              onClick={() => setShowPopup(true)}
              className="bg-white text-red-600 hover:bg-red-50 px-8 py-4 text-lg font-bold"
              size="lg"
            >
              <MessageSquare className="w-6 h-6 mr-2" />
              Viết tin nhắn ngay
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Messages */}
      <div className="container mx-auto px-4 mb-8">
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Tin nhắn gần đây
            </h3>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {submissions.slice(-10).reverse().map((submission) => (
                <div key={submission.id} className="flex items-start space-x-2 p-2 bg-gray-50 rounded">
                  <div className="font-medium text-red-600">{submission.name}:</div>
                  <div className="text-gray-700 text-sm">{submission.content}</div>
                </div>
              ))}
              {submissions.length === 0 && (
                <p className="text-gray-500 text-center py-4">Chưa có tin nhắn nào. Hãy là người đầu tiên gửi lời chúc!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Submit Button */}
      <Button
        onClick={() => setShowPopup(true)}
        className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-xl z-50"
        size="lg"
      >
        <MessageSquare className="w-6 h-6" />
      </Button>

      {/* Popup Form */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-white max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-red-600">Gửi lời chúc</h2>
                <Button
                  onClick={() => setShowPopup(false)}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="isAnonymous"
                    name="isAnonymous"
                    checked={formData.isAnonymous}
                    onChange={handleInputChange}
                    className="rounded"
                  />
                  <label htmlFor="isAnonymous" className="text-sm text-gray-600">
                    Gửi ẩn danh
                  </label>
                </div>

                <div>
                  <Input
                    name="name"
                    placeholder="Họ và tên *"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={formData.isAnonymous}
                    required={!formData.isAnonymous}
                    className="w-full"
                  />
                </div>

                {!formData.isAnonymous && (
                  <>
                    <div>
                      <Input
                        name="studentId"
                        placeholder="Mã số sinh viên"
                        value={formData.studentId}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <Input
                        name="className"
                        placeholder="Lớp"
                        value={formData.className}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <Input
                        name="faculty"
                        placeholder="Khoa"
                        value={formData.faculty}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <Input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>
                  </>
                )}

                <div>
                  <Textarea
                    name="content"
                    placeholder="Nội dung lời chúc *"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    className="w-full"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm text-gray-600">Tải ảnh lên (tùy chọn)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {formData.image && (
                    <p className="text-sm text-green-600 mt-1">
                      Đã chọn: {formData.image.name}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  {isLoading ? 'Đang gửi...' : 'Gửi lời chúc'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
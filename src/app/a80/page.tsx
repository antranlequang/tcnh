"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { X, MessageSquare, Upload, User, Calendar, MapPin, Mail, GraduationCap } from 'lucide-react';

interface Submission {
  id: string;
  name: string;
  student_id?: string;
  class_name?: string;
  faculty?: string;
  email?: string;
  content: string;
  image_url?: string;
  is_anonymous: boolean;
  created_at: string;
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

interface FloatingName {
  text: string;
  x: number;
  y: number;
  speed: number;
  opacity: number;
  fontSize: number;
}

export default function A80Page() {
  const [showPopup, setShowPopup] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [floatingNames, setFloatingNames] = useState<FloatingName[]>([]);
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
  const animationFrameRef = useRef<number>();

  // Vietnamese flag dimensions and colors
  const RED_COLOR = '#DA251D';
  const YELLOW_COLOR = '#FFD700';
  
  // 🎯 CONFIGURABLE: Change this number to adjust total pixels for testing
  const TOTAL_PIXELS = 20; // Currently set to 20 pixels for 20 comments

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    setupFloatingNames();
    // Delay drawing flag to ensure canvas is ready
    setTimeout(() => {
      drawVietnameseFlag();
      startAnimation();
    }, 100);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [submissions]);

  // Handle body overflow when popup is open
  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = 'auto';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showPopup]);

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

  const setupFloatingNames = () => {
    if (submissions.length === 0) return;

    const names: FloatingName[] = [];
    const canvas = flagCanvasRef.current;
    if (!canvas) return;

    // Create multiple instances of names for continuous scrolling
    for (let i = 0; i < Math.min(submissions.length * 3, 20); i++) {
      const submission = submissions[i % submissions.length];
      names.push({
        text: submission.name,
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.3 + Math.random() * 0.7, // Random speed between 0.3-1.0
        opacity: 0.1 + Math.random() * 0.15, // Very light opacity 0.1-0.25
        fontSize: 12 + Math.random() * 8 // Font size between 12-20
      });
    }
    setFloatingNames(names);
  };

  const animateFloatingNames = () => {
    const canvas = flagCanvasRef.current;
    if (!canvas) return;

    setFloatingNames(prevNames => 
      prevNames.map(name => ({
        ...name,
        x: name.x - name.speed,
        // Reset position when name goes off screen
        ...(name.x < -100 ? {
          x: canvas.width + 100,
          y: Math.random() * canvas.height
        } : {})
      }))
    );
  };

  const startAnimation = () => {
    const animate = () => {
      animateFloatingNames();
      drawVietnameseFlag();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();
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
    
    if (!formData.isAnonymous && !formData.name.trim()) {
      alert('Vui lòng nhập tên hoặc chọn ẩn danh!');
      return;
    }
    
    if (!formData.content.trim()) {
      alert('Nội dung là bắt buộc!');
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

    // Draw blurry background flag first - covers entire canvas
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.filter = 'blur(3px)';
    ctx.fillStyle = RED_COLOR;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Add blurry yellow star in center
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const starRadius = Math.min(canvasWidth, canvasHeight) * 0.15;
    ctx.fillStyle = YELLOW_COLOR;
    ctx.beginPath();
    ctx.arc(centerX, centerY, starRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();

    // Draw floating names on top of blurry flag
    ctx.save();
    floatingNames.forEach(name => {
      ctx.globalAlpha = name.opacity;
      ctx.fillStyle = '#888888';
      ctx.font = `${name.fontSize}px Arial`;
      ctx.fillText(name.text, name.x, name.y);
    });
    ctx.restore();

    // Load flag image for pixel template
    const img = new Image();
    img.onload = () => {
      console.log('Flag image loaded successfully!', img.width, img.height);
      
      // Calculate exact grid for configurable pixels
      const targetPixels = TOTAL_PIXELS;
      const aspectRatio = canvasWidth / canvasHeight;
      const rows = Math.floor(Math.sqrt(targetPixels / aspectRatio));
      const cols = Math.floor(targetPixels / rows);
      const actualPixels = rows * cols;
      
      const pixelWidth = Math.floor(canvasWidth / cols);
      const pixelHeight = Math.floor(canvasHeight / rows);
      
      console.log('Grid info:', { rows, cols, actualPixels, pixelWidth, pixelHeight, submissions: submissions.length });
      
      // Create flag template from actual image
      const flagTemplate = createFlagTemplateFromImage(img, cols, rows);
      
      // Draw clear pixels ONLY for submissions - leave others blurred
      let submissionIndex = 0;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (submissionIndex < submissions.length) {
            const x = col * pixelWidth;
            const y = row * pixelHeight;
            const templateColor = flagTemplate[row][col];
            
            // Draw clear, sharp pixel for submitted messages
            ctx.fillStyle = templateColor;
            ctx.fillRect(x, y, pixelWidth, pixelHeight);
            
            // Add subtle border to make the pixel stand out from blurred background
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, pixelWidth, pixelHeight);
            
            submissionIndex++;
          }
          // No else clause - unfilled pixels remain as blurred background
        }
      }
      
      console.log('Finished drawing', submissionIndex, 'clear pixels out of', actualPixels, 'total pixels');
    };
    
    img.onerror = (error) => {
      console.error('Failed to load flag image:', error);
      console.log('Falling back to procedural generation');
      drawFallbackFlag(ctx, canvasWidth, canvasHeight);
    };
    
    console.log('Attempting to load image:', '/images/vietnam-flag-pixel.svg');
    img.src = '/images/vietnam-flag-pixel.svg';
  };

  const drawFallbackFlag = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    console.log('Drawing fallback flag');
    
    // Draw blurry background flag (procedural version)
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.filter = 'blur(3px)';
    ctx.fillStyle = RED_COLOR;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Add blurry yellow star in center
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const starRadius = Math.min(canvasWidth, canvasHeight) * 0.15;
    ctx.fillStyle = YELLOW_COLOR;
    ctx.beginPath();
    ctx.arc(centerX, centerY, starRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
    
    // Calculate exact grid for configurable pixels
    const targetPixels = TOTAL_PIXELS;
    const aspectRatio = canvasWidth / canvasHeight;
    const rows = Math.floor(Math.sqrt(targetPixels / aspectRatio));
    const cols = Math.floor(targetPixels / rows);
    
    const pixelWidth = Math.floor(canvasWidth / cols);
    const pixelHeight = Math.floor(canvasHeight / rows);
    
    // Draw clear pixels ONLY for submissions
    let submissionIndex = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (submissionIndex < submissions.length) {
          const x = col * pixelWidth;
          const y = row * pixelHeight;
          
          // Simple fallback: red background with yellow star area in center
          const centerXGrid = cols / 2;
          const centerYGrid = rows / 2;
          const starRadiusGrid = Math.min(cols, rows) * 0.15;
          const distance = Math.sqrt((col - centerXGrid) ** 2 + (row - centerYGrid) ** 2);
          const templateColor = distance < starRadiusGrid ? YELLOW_COLOR : RED_COLOR;
          
          // Draw clear, sharp pixel for submitted messages
          ctx.fillStyle = templateColor;
          ctx.fillRect(x, y, pixelWidth, pixelHeight);
          
          // Add subtle border to make the pixel stand out
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, pixelWidth, pixelHeight);
          
          submissionIndex++;
        }
        // No else clause - unfilled pixels remain as blurred background
      }
    }
  };

  const createFlagTemplateFromImage = (img: HTMLImageElement, cols: number, rows: number): string[][] => {
    const template: string[][] = [];
    
    // Create a temporary canvas to sample the image
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return template;
    
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    
    // Draw the image to the temporary canvas
    tempCtx.drawImage(img, 0, 0);
    
    // Sample colors from the image and create pixel template
    for (let row = 0; row < rows; row++) {
      template[row] = [];
      for (let col = 0; col < cols; col++) {
        // Calculate the corresponding pixel position in the source image
        const imgX = Math.floor((col / cols) * img.width);
        const imgY = Math.floor((row / rows) * img.height);
        
        // Get the pixel data from the image
        const imageData = tempCtx.getImageData(imgX, imgY, 1, 1);
        const [r, g, b] = imageData.data;
        
        // Convert RGB to hex
        const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        template[row][col] = hexColor;
      }
    }
    
    return template;
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 relative">

        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-2 flex items-center justify-center gap-2">
            <img src="/images/vietnam-flag-pixel.svg" alt="Quốc kỳ Việt Nam" className="w-8 h-8 object-contain" />
            RẠNG RỠ VIỆT NAM
            <img src="/images/vietnam-flag-pixel.svg" alt="Quốc kỳ Việt Nam" className="w-8 h-8 object-contain" />
          </h1>
          <p className="text-gray-600">
            Hãy cùng Đoàn khoa Tài chính - Ngân hàng gửi những lời chúc đến với Thủ Đô
          </p>
        </div>

        {/* Flag Canvas */}
        <ScrollReveal>
          <div className="container mx-auto px-4 mb-10">
            <div className="relative w-full max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
              <canvas
                ref={flagCanvasRef}
                width={1000}
                height={667}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </ScrollReveal>

        {/* Call to Action */}
        <div className="container mx-auto px-4 mb-8">
          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Gửi lời chúc của bạn ngay!</h2>
              <p className="text-red-100 mb-6">
                Mỗi tin nhắn sẽ trở thành một pixel giúp tạo nên lá cờ Tổ quốc Việt Nam. Cần {TOTAL_PIXELS} lời chúc để hoàn thành lá cờ!
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


        {/* Submissions Display */}
        <ScrollReveal delayMs={400}>
          <div className="container mx-auto px-4 mb-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
              <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Lời chúc gần đây
                </h3>
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                    {submissions.length}/{TOTAL_PIXELS} lời chúc
                  </div>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, (submissions.length / TOTAL_PIXELS) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="max-h-[600px] overflow-y-auto space-y-4">
                {submissions.slice(-10).reverse().map((submission) => (
                  <div key={submission.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-red-600" />
                        <span className="font-semibold text-red-600">{submission.name}</span>
                        {submission.is_anonymous && (
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded">Ẩn danh</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(submission.created_at)}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-2">{submission.content}</p>
                    
                    {!submission.is_anonymous && (
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        {submission.student_id && (
                          <span className="flex items-center">
                            <GraduationCap className="w-3 h-3 mr-1" />
                            {submission.student_id}
                          </span>
                        )}
                        {submission.class_name && (
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {submission.class_name}
                          </span>
                        )}
                        {submission.faculty && (
                          <span>{submission.faculty}</span>
                        )}
                        {submission.email && (
                          <span className="flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {submission.email}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {submission.image_url && (
                      <img
                        src={submission.image_url}
                        alt="Attachment"
                        className="mt-2 max-h-32 rounded border"
                      />
                    )}
                  </div>
                ))}
                {submissions.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Chưa có lời chúc nào. Hãy là người đầu tiên!</p>
                )}
              </div>
              </CardContent>
            </Card>
          </div>
        </ScrollReveal>

        {/* Floating Submit Button */}
        <Button
          onClick={() => setShowPopup(true)}
          className="fixed bottom-6 right-6 bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-xl z-40"
          size="lg"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>

        {/* Popup Form */}
        {showPopup && (
          <div className="fixed inset-0 top-0 left-0 right-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-md max-h-[90vh] overflow-y-auto">
              <Card className="bg-white">
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

                  {!formData.isAnonymous && (
                    <>
                      <div>
                        <Input
                          name="name"
                          placeholder="Họ và tên *"
                          value={formData.name}
                          onChange={handleInputChange}
                          required={!formData.isAnonymous}
                          className="w-full"
                        />
                      </div>

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
          </div>
        )}
    </div>
  );
}
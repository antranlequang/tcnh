"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { MessageSquare, User, Calendar, MapPin, Mail, GraduationCap } from 'lucide-react';

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
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [floatingNames, setFloatingNames] = useState<FloatingName[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    studentId: '',
    className: '',
    faculty: '',
    email: '',
    content: '',
    isAnonymous: false
  });

  const flagCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const flagImageRef = useRef<HTMLImageElement | null>(null);

  // Vietnamese flag dimensions and colors
  const RED_COLOR = '#DA251D';
  const YELLOW_COLOR = '#FFD700';
  
  // 🎯 CONFIGURABLE: Change this number to adjust total pixels for testing
  const TOTAL_PIXELS = 1000;

  // Deterministic PRNG for stable random ordering per grid size
  const mulberry32 = (seed: number) => {
    return () => {
      let t = (seed += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967295;
    };
  };
  

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      drawVietnameseFlag();
    }, 0);
  
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [submissions]);

  useEffect(() => {
    const img = new Image();
    img.src = '/images/quocky.png';
    img.onload = () => {
      flagImageRef.current = img;
      // Add small delay to ensure canvas is ready
      setTimeout(() => {
        drawVietnameseFlag();
      }, 100);
    };
    img.onerror = () => {
      console.error('Failed to load flag image');
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const canvas = flagCanvasRef.current;
      if (canvas) {
        const parent = canvas.parentElement;
        if (parent) {
          canvas.width = parent.clientWidth;
          canvas.height = parent.clientWidth * 2/3; // tỷ lệ 3:2
          drawVietnameseFlag();
        }
      }
    };
  
    window.addEventListener('resize', handleResize);
    handleResize();
  
    return () => window.removeEventListener('resize', handleResize);
  }, [submissions]);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/a80/submissions?include_total=true');
      if (!response.ok) {
        console.error('Failed to fetch submissions, status', response.status);
        return;
      }
  
      const json = await response.json();
      console.log('API Response:', json);
  
      let items: Submission[] = [];
      let actualTotal: number;
  
      // Check if response includes total count
      if (json && typeof json.total === 'number' && Array.isArray(json.submissions)) {
        items = json.submissions;
        actualTotal = json.total;
        console.log('Found total in response:', actualTotal);
      } else if (json && typeof json.total === 'number' && Array.isArray(json.data)) {
        items = json.data;
        actualTotal = json.total;
        console.log('Found total in response:', actualTotal);
      } else if (Array.isArray(json)) {
        items = json;
        actualTotal = items.length; // fallback if no total provided
        console.warn('No total count provided, using array length:', actualTotal);
      } else {
        console.warn('Unexpected response format:', json);
        items = [];
        actualTotal = 0;
      }
  
      setSubmissions(items);
      setTotalCount(actualTotal);
      console.log('Set totalCount to:', actualTotal, 'submissions count:', items.length);
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
          isAnonymous: false
        });
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
    if (!canvas) {
      console.log('Canvas not available');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('Canvas context not available');
      return;
    }
  
    const img = flagImageRef.current;
    if (!img) {
      console.log('Flag image not loaded yet');
      return;
    }

    console.log('Drawing flag - Canvas dimensions:', canvas.width, 'x', canvas.height);
    console.log('Drawing flag - Image dimensions:', img.width, 'x', img.height);
  
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
  
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
    // 2) Grid cố định, ví dụ 50x33
    const rows = 46;
    const cols = 69;
    const cellW = Math.floor(canvasWidth / cols);
    const cellH = Math.floor(canvasHeight / rows);
    
    // 1) Draw blurred Vietnamese flag as background - fill entire canvas
    ctx.save();
    ctx.globalAlpha = 0.005;
    ctx.filter = 'blur(0.5px)';
    ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
    ctx.restore();
  
    const positions: { row: number; col: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        positions.push({ row: r, col: c });
      }
    }
  

    // 4) Shuffle ổn định bằng PRNG
    const seed = 1337;
    const rng = mulberry32(seed);
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
  
    // 5) Vẽ các ô theo số submissions, mỗi ô là 1 comment - MAX 3174 pixels
    const actualTotalCount = totalCount ?? submissions.length;
    const revealCount = Math.min(actualTotalCount, TOTAL_PIXELS); // Cap at 3174 pixels
    for (let k = 0; k < revealCount; k++) {
      const { row, col } = positions[k];
      const dx = col * cellW;
      const dy = row * cellH;
    
      // Calculate source coordinates from the original flag image
      const sx = (col / cols) * img.width;
      const sy = (row / rows) * img.height;
      const sw = img.width / cols;
      const sh = img.height / rows;
    
      // Draw the actual section of the flag image (not just a color)
      ctx.save();
      ctx.globalAlpha = 1.0; // Full opacity for revealed pixels
      
      // Draw the section of the original flag image
      ctx.drawImage(
        img,
        sx, sy, sw, sh, // Source rectangle from flag image
        dx, dy, cellW, cellH // Destination rectangle on canvas
      );
      
      ctx.restore();
    
      // Add subtle border to make the pixel stand out
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(dx, dy, cellW, cellH);
    }
  };

  const drawFallbackFlag = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    console.log('Drawing fallback flag');
    
    // Try to use actual flag image even in fallback
    const fallbackImg = new Image();
    fallbackImg.onload = () => {
      // Draw blurry background using actual Vietnamese flag image
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.filter = 'blur(3px)';
      ctx.drawImage(fallbackImg, 0, 0, canvasWidth, canvasHeight);
      ctx.restore();
      
      // Calculate exact grid for configurable pixels
      const targetPixels = TOTAL_PIXELS;
      const aspectRatio = canvasWidth / canvasHeight;
      const rows = Math.floor(Math.sqrt(targetPixels / aspectRatio));
      const cols = Math.floor(targetPixels / rows);
      
      const pixelWidth = Math.floor(canvasWidth / cols);
      const pixelHeight = Math.floor(canvasHeight / rows);
      
      // Create flag template from actual image
      const flagTemplate = createFlagTemplateFromImage(fallbackImg, cols, rows);
      
      // Create array of all possible pixel positions and shuffle them
      const allPositions: {row: number, col: number}[] = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          allPositions.push({row, col});
        }
      }
      const shuffledPositions = [...allPositions].sort(() => Math.random() - 0.5);
      
      // Draw clear pixels ONLY for submissions in random positions
      const actualTotalCount = totalCount ?? submissions.length;
      for (let submissionIndex = 0; submissionIndex < Math.min(actualTotalCount, shuffledPositions.length); submissionIndex++) {
        const {row, col} = shuffledPositions[submissionIndex];
        const x = col * pixelWidth;
        const y = row * pixelHeight;
        const templateColor = flagTemplate[row][col];
        
        // Draw clear, sharp pixel for submitted messages
        ctx.fillStyle = templateColor;
        ctx.fillRect(x, y, pixelWidth, pixelHeight);
        
        // Add subtle border to make the pixel stand out
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, pixelWidth, pixelHeight);
      }
    };
    
    fallbackImg.onerror = () => {
      // Last resort: procedural flag
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.filter = 'blur(3px)';
      ctx.fillStyle = RED_COLOR;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;
      const starRadius = Math.min(canvasWidth, canvasHeight) * 0.15;
      ctx.fillStyle = YELLOW_COLOR;
      ctx.beginPath();
      ctx.arc(centerX, centerY, starRadius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    };
    
    fallbackImg.src = '/images/quocky.png';
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 relative overflow-hidden">
      {/* Animated floating stars */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          >
            <div className="w-1 h-1 bg-yellow-400 rounded-full shadow-lg" 
                 style={{
                   boxShadow: '0 0 6px rgba(255,215,0,0.8), 0 0 12px rgba(255,215,0,0.4)'
                 }}
            />
          </div>
        ))}
      </div>
      
      {/* Red gradient overlay at top */}
      <div className="absolute top-0 left-0 w-full h-[30vh] md:h-[60vh] bg-gradient-to-b from-red-500 via-red-400/15 to-transparent pointer-events-none z-5"></div>

        {/* Header */}
        <div className="text-center py-6 relative z-10">
          <h1 className="text-3xl md:text-8xl font-medium text-yellow-300 mb-4 md:mb-6 mt-4 md:mt-12 flex items-center justify-center font-ocean-rush transform hover:scale-105 transition-all duration-500 drop-shadow-2xl" style={{textShadow: '4px 4px 8px rgba(0,0,0,0.3), 0 0 20px rgba(255,215,0,0.5)'}}>
            <img src="/images/quocky.png" alt="Việt Nam" className="w-8 md:w-20 h-auto object-cover rounded-lg mx-4 md:mx-8 transform hover:rotate-12 hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-yellow-400/50"/>
            RẠNG RỠ VIỆT NAM
            <img src="/images/quocky.png" alt="Việt Nam" className="w-8 md:w-20 h-auto object-cover rounded-lg mx-4 md:mx-8 transform hover:-rotate-12 hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-yellow-400/50"/>
          </h1>
        </div>

        {/* Flag Canvas and Form - Responsive Layout */}
        <ScrollReveal>
          <div className="container mx-auto px-4 mb-10">
            {/* Unified Responsive Layout */}
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Form Section - Responsive Width */}
              <div className="w-full lg:w-[35%] xl:w-[30%] order-2 lg:order-1">
                <Card className="bg-white shadow-xl h-fit transform hover:scale-105 hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl hover:shadow-red-200/50 border-2 hover:border-red-300">
                  <CardContent className="p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-red-600 mb-4 text-center lg:text-left">Nhập lời chúc của bạn</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-center lg:justify-start space-x-2 mb-4">
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
                        <div className="space-y-3 sm:space-y-4">
                          <Input
                            name="name"
                            placeholder="Họ và tên *"
                            value={formData.name}
                            onChange={handleInputChange}
                            required={!formData.isAnonymous}
                            className="w-full"
                          />

                          <Input
                            name="studentId"
                            placeholder="Mã số sinh viên"
                            value={formData.studentId}
                            onChange={handleInputChange}
                            className="w-full"
                          />

                          <Input
                            name="className"
                            placeholder="Lớp"
                            value={formData.className}
                            onChange={handleInputChange}
                            className="w-full"
                          />

                          <Input
                            name="faculty"
                            placeholder="Khoa"
                            value={formData.faculty}
                            onChange={handleInputChange}
                            className="w-full"
                          />

                          <Input
                            name="email"
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full"
                          />
                        </div>
                      )}

                      <Textarea
                        name="content"
                        placeholder="Nội dung lời chúc *"
                        value={formData.content}
                        onChange={handleInputChange}
                        required
                        className="w-full"
                        rows={4}
                      />

                      <div className="flex justify-center lg:justify-start">
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white px-6 sm:px-8 py-2 sm:py-3 lg:w-full transform hover:scale-110 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-red-400/50 border-2 border-red-600 hover:border-red-400"
                          size="lg"
                          style={{textShadow: '1px 1px 2px rgba(0,0,0,0.3)'}}
                        >
                          {isLoading ? 'Đang gửi...' : 'Gửi lời chúc'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
              
              {/* Flag Canvas - Responsive Size and Position */}
              <div className="w-full lg:w-[65%] xl:w-[70%] order-1 lg:order-2">
                <div className="relative bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-[280px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[600px] xl:max-w-[900px] mx-auto aspect-[3/2] transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl hover:shadow-red-300/30 border-2 hover:border-red-400">
                  <canvas
                    ref={flagCanvasRef}
                    width={1000}
                    height={667}
                    className="w-full h-auto block"
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Call to Action */}
        <div className="container mx-auto px-4 mb-8">
          <Card className="bg-gradient-to-r from-red-600 via-red-500 to-red-700 text-white transform hover:scale-105 transition-all duration-500 shadow-2xl hover:shadow-red-400/30 border-2 border-red-400 hover:border-yellow-300">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl md:text-3xl font-medium font-anton mb-4">TỔNG SỐ LỜI CHÚC HIỆN TẠI</h2>
              <div className="text-6xl md:text-8xl font-extrabold text-yellow-300 mb-4 font-ocean-rush transform hover:scale-110 transition-all duration-300 animate-pulse" style={{textShadow: '4px 4px 8px rgba(0,0,0,0.5), 0 0 30px rgba(255,215,0,0.8)'}}>
                {totalCount ?? submissions.length}
              </div>
              <p className="text-red-100 font-bold">
                Mỗi lời chúc là một phần giúp tô điểm lá cờ Tổ quốc Việt Nam.
              </p>
            </CardContent>
          </Card>
        </div>


        {/* Submissions Display */}
        <ScrollReveal delayMs={400}>
          <div className="container mx-auto px-4 mb-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-xl transform hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl hover:shadow-blue-200/30 border-2 hover:border-blue-300">
              <CardContent className="p-6">
              <div className="flex justify-center items-center gap-2 mb-7 mt-2">
                <img 
                  src="/images/quocky.png" 
                  alt="Việt Nam" 
                  className="w-6 h-auto object-cover rounded-sm" 
                />
                <span className="text-2xl md:text-5xl font-passions font-medium text-center">
                  Độc lập - Tự do - Hạnh phúc
                </span>
                <img 
                  src="/images/quocky.png" 
                  alt="Việt Nam" 
                  className="w-6 h-auto object-cover rounded-sm" 
                />
              </div>
              {submissions.length === 0 ? (
                <div className="text-gray-500 text-center py-4">
                  Chưa có lời chúc nào. Hãy là người đầu tiên!
                </div>
              ) : (
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-0">
                  {[...submissions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((submission) => (
                    <div key={submission.id} className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 border border-gray-200 mb-4 break-inside-avoid transform hover:scale-105 hover:-translate-y-1 transition-all duration-200 hover:shadow-lg hover:shadow-gray-300/50 hover:border-red-300">
                      <div className="mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-red-600" />
                          <span className="font-semibold text-red-600 text-sm">{submission.name}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 text-sm mb-3 break-words">{submission.content}</p>
                      
                      
                      
                      {/* Vietnamese flag at the end of each comment */}
                      <div className="mt-2 relative">
                        <img 
                          src="/images/quocky.png"  
                          alt="Việt Nam" 
                          className="w-full h-auto object-cover aspect-[3/2] rounded-sm"
                          style={{
                            filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.1))'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </CardContent>
            </Card>
          </div>
        </ScrollReveal>


    </div>
  );
}
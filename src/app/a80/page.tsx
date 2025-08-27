"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import Image from 'next/image';

interface Comment {
  id: string;
  name: string;
  studentId: string;
  email: string;
  faculty: string;
  className: string;
  photo?: string;
  content: string;
  timestamp: number;
}

interface PostFormData {
  name: string;
  studentId: string;
  email: string;
  faculty: string;
  className: string;
  photo?: File | null;
  content: string;
}

export default function A80Page() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [formData, setFormData] = useState<PostFormData>({
    name: '',
    studentId: '',
    email: '',
    faculty: '',
    className: '',
    photo: null,
    content: ''
  });
  const [showPopupForm, setShowPopupForm] = useState(false);
  const [currentDisplayIndex, setCurrentDisplayIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isZoomedOut, setIsZoomedOut] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
  const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });
  const [selectionBox, setSelectionBox] = useState<{x: number, y: number, width: number, height: number} | null>(null);
  const [isDragMode, setIsDragMode] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const canvasSize = { width: 8000, height: 6000 }; // Much larger canvas size

  useEffect(() => {
    const savedComments = localStorage.getItem('a80-comments');
    if (savedComments) {
      const parsedComments = JSON.parse(savedComments);
      setComments(parsedComments);
    } else {
      // Add some test comments if none exist
      const testComments = [
        {
          id: 'test-1',
          name: 'Nguyen Van A',
          studentId: '20210001',
          email: 'nva@example.com',
          faculty: 'Tài chính - Ngân hàng',
          className: 'TC21A',
          content: 'Tôi yêu Việt Nam, đất nước tôi. Chúc mừng Quốc khánh 2/9!',
          timestamp: Date.now() - 100000
        },
        {
          id: 'test-2',
          name: 'Tran Thi B',
          studentId: '20210002',
          email: 'ttb@example.com',
          faculty: 'Tài chính - Ngân hàng',
          className: 'TC21B',
          content: 'Việt Nam - Đất nước tôi, tình yêu bao la như biển cả!',
          timestamp: Date.now() - 200000
        },
        {
          id: 'test-3',
          name: 'Le Van C',
          studentId: '20210003',
          email: 'lvc@example.com',
          faculty: 'Tài chính - Ngân hàng',
          className: 'TC21C',
          content: 'Tự hào là người Việt Nam! 🇻🇳',
          timestamp: Date.now() - 300000
        }
      ];
      setComments(testComments);
      localStorage.setItem('a80-comments', JSON.stringify(testComments));
    }
  }, []);

  // Auto-scroll through messages
  useEffect(() => {
    if (comments.length > 0 && isAutoScrolling) {
      const interval = setInterval(() => {
        setCurrentDisplayIndex(prev => (prev + 1) % comments.length);
      }, 3000); // Change message every 3 seconds

      return () => clearInterval(interval);
    }
  }, [comments.length, isAutoScrolling]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.content.trim()) {
      alert('Vui lòng nhập Tên và Nội dung');
      return;
    }

    // Convert photo to base64 if present
    let photoBase64 = '';
    if (formData.photo) {
      const reader = new FileReader();
      reader.onloadend = () => {
        photoBase64 = reader.result as string;
        saveComment(photoBase64);
      };
      reader.readAsDataURL(formData.photo);
    } else {
      saveComment('');
    }
  };

  const saveComment = (photoBase64: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      studentId: formData.studentId.trim(),
      email: formData.email.trim(),
      faculty: formData.faculty.trim(),
      className: formData.className.trim(),
      photo: photoBase64,
      content: formData.content.trim(),
      timestamp: Date.now()
    };

    const updatedComments = [newComment, ...comments];
    setComments(updatedComments);
    localStorage.setItem('a80-comments', JSON.stringify(updatedComments));
    
    // Reset form
    setFormData({
      name: '',
      studentId: '',
      email: '',
      faculty: '',
      className: '',
      photo: null,
      content: ''
    });
    
    // Close form after successful submission
    setShowPopupForm(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.target.type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      const file = fileInput.files?.[0] || null;
      setFormData({
        ...formData,
        photo: file
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      // Selection mode (Ctrl/Cmd + click and drag)
      setIsSelecting(true);
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const startX = e.clientX - rect.left - canvasPosition.x;
        const startY = e.clientY - rect.top - canvasPosition.y;
        setSelectionStart({ x: startX, y: startY });
        setSelectionEnd({ x: startX, y: startY });
      }
    } else {
      // Pan mode (regular click and drag)
      setIsDragging(true);
      setDragStart({ x: e.clientX - canvasPosition.x, y: e.clientY - canvasPosition.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isSelecting) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const endX = e.clientX - rect.left - canvasPosition.x;
        const endY = e.clientY - rect.top - canvasPosition.y;
        setSelectionEnd({ x: endX, y: endY });
        
        // Update selection box
        const minX = Math.min(selectionStart.x, endX);
        const minY = Math.min(selectionStart.y, endY);
        const width = Math.abs(endX - selectionStart.x);
        const height = Math.abs(endY - selectionStart.y);
        
        setSelectionBox({ x: minX, y: minY, width, height });
      }
    } else if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Limit canvas movement to prevent going too far off-screen
      const maxX = window.innerWidth - canvasSize.width;
      const maxY = window.innerHeight - canvasSize.height;
      
      setCanvasPosition({
        x: Math.min(0, Math.max(maxX, newX)),
        y: Math.min(0, Math.max(maxY, newY))
      });
    }
  };

  const handleMouseUp = () => {
    if (isSelecting) {
      setIsSelecting(false);
      // Keep the selection box visible
    } else {
      setIsDragging(false);
    }
  };

  const clearSelection = () => {
    setSelectionBox(null);
  };

  const handleDoubleClick = () => {
    if (isZoomedOut) {
      // Zoom back in to normal view
      setCanvasPosition({ x: 0, y: 0 });
      setIsZoomedOut(false);
    } else {
      // Zoom out to show entire canvas
      const centerX = -(canvasSize.width - window.innerWidth) / 2;
      const centerY = -(canvasSize.height - window.innerHeight) / 2;
      setCanvasPosition({ x: centerX, y: centerY });
      setIsZoomedOut(true);
    }
  };

  return (
    <div className="h-full bg-white overflow-hidden">
      {/* Large Canvas Area - Full Available Height */}
      <div className="relative h-full overflow-hidden bg-white">
        <div 
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
          className={`absolute bg-gradient-to-br from-red-50 via-white to-yellow-50 ${
            isSelecting ? 'cursor-crosshair' : isDragging ? 'cursor-grabbing' : 'cursor-grab'
          } select-none transition-transform duration-300 ease-out`}
          style={{ 
            width: `${canvasSize.width}px`,
            height: `${canvasSize.height}px`,
            transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px) ${
              isZoomedOut ? 'scale(0.4)' : 'scale(1)'
            }`,
            transformOrigin: 'top left'
          }}
        >
          {/* Background Pattern - Distributed across larger canvas */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-20 left-20 w-64 h-64 bg-red-500 rounded-full blur-3xl"></div>
            <div className="absolute top-60 right-40 w-80 h-80 bg-yellow-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-40 left-1/3 w-72 h-72 bg-red-600 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 right-1/4 w-56 h-56 bg-yellow-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-64 h-64 bg-red-400 rounded-full blur-3xl"></div>
            <div className="absolute top-1/4 left-1/2 w-96 h-96 bg-red-300 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-yellow-300 rounded-full blur-3xl"></div>
            <div className="absolute top-3/4 right-1/3 w-72 h-72 bg-red-600 rounded-full blur-3xl"></div>
            <div className="absolute top-10 right-10 w-64 h-64 bg-yellow-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-88 h-88 bg-red-500 rounded-full blur-3xl"></div>
          </div>

          {/* Title Overlay */}
          <div className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-yellow-500 text-white px-6 py-3 rounded-2xl shadow-xl">
            <h1 className="text-2xl font-bold">🇻🇳 A80 - Tổ Quốc Tôi</h1>
            <p className="text-sm opacity-90">Gửi tâm tình đến Việt Nam thân yêu</p>
          </div>

          {/* Instructions */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-5 py-4 rounded-2xl shadow-xl border-2 border-red-200">
            <p className="text-base text-gray-700 font-semibold">🖱️ Kéo thả để di chuyển</p>
            <p className="text-base text-gray-700 font-semibold">👆 Nhấp đôi để {isZoomedOut ? 'phóng to' : 'thu nhỏ'}</p>
            <p className="text-base text-gray-700 font-semibold">⌘ Ctrl+Kéo để chọn vùng</p>
            {selectionBox && (
              <button 
                onClick={clearSelection}
                className="text-sm text-red-600 font-bold mt-2 hover:text-red-800 underline block"
              >
                ❌ Xóa vùng chọn
              </button>
            )}
            {isZoomedOut && <p className="text-sm text-red-600 font-bold mt-2">📍 Chế độ xem toàn cảnh (8000x6000px)</p>}
            {!isZoomedOut && <p className="text-sm text-green-600 font-bold mt-2">🔍 Chế độ xem chi tiết</p>}
            <p className="text-xs text-gray-500 mt-2">Số cảm xúc: {comments.length}</p>
          </div>

          {/* Main Display Area - Auto-scrolling Messages */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border-4 border-red-200 flex flex-col overflow-hidden z-25">
            <div className="bg-gradient-to-r from-red-600 to-yellow-500 text-white p-4 text-center">
              <h2 className="text-xl font-bold">💝 Tình cảm của bạn</h2>
              <p className="text-sm opacity-90">Những chia sẻ chân thành về Tổ quốc</p>
            </div>
            
            <div className="flex-1 flex flex-col justify-center p-6 relative">
              {comments.length > 0 && (
                <div className="text-center space-y-4 animate-fade-in">
                  <div className="text-lg font-semibold text-red-600">
                    "{comments[currentDisplayIndex]?.name}"
                  </div>
                  <div className="text-gray-800 text-base leading-relaxed px-4">
                    {comments[currentDisplayIndex]?.content}
                  </div>
                </div>
              )}
              
              {comments.length === 0 && (
                <div className="text-center text-gray-500">
                  <p>Chưa có chia sẻ nào</p>
                  <p className="text-sm mt-2">Hãy là người đầu tiên gửi tâm tư!</p>
                </div>
              )}
              
              {comments.length > 1 && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {comments.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentDisplayIndex(index);
                        setIsAutoScrolling(false);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentDisplayIndex 
                          ? 'bg-red-600 w-6' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Auto-scroll control */}
            <div className="absolute top-2 right-2">
              <button
                onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                className={`w-8 h-8 rounded-full text-xs ${
                  isAutoScrolling 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}
                title={isAutoScrolling ? 'Tắt tự động cuộn' : 'Bật tự động cuộn'}
              >
                {isAutoScrolling ? '⏸️' : '▶️'}
              </button>
            </div>
          </div>

          {/* Small Floating Post Button */}
          <button 
            onClick={() => setShowPopupForm(true)}
            className="absolute bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center text-2xl z-30 hover:scale-110"
            title="Gửi tâm tư về Tổ quốc"
          >
            ✏️
          </button>

          {/* Selection Box */}
          {selectionBox && (
            <div
              className="absolute border-4 border-red-500 bg-red-200/20 backdrop-blur-sm rounded-lg pointer-events-none"
              style={{
                left: selectionBox.x,
                top: selectionBox.y,
                width: selectionBox.width,
                height: selectionBox.height,
                zIndex: 20,
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.5), inset 0 0 20px rgba(239, 68, 68, 0.1)'
              }}
            >
              <div className="absolute -top-8 left-0 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                Vùng xem cảm xúc ({Math.round(selectionBox.width)}×{Math.round(selectionBox.height)})
              </div>
            </div>
          )}

          {/* Selection in Progress */}
          {isSelecting && (
            <div
              className="absolute border-4 border-dashed border-yellow-500 bg-yellow-200/10 pointer-events-none"
              style={{
                left: Math.min(selectionStart.x, selectionEnd.x),
                top: Math.min(selectionStart.y, selectionEnd.y),
                width: Math.abs(selectionEnd.x - selectionStart.x),
                height: Math.abs(selectionEnd.y - selectionStart.y),
                zIndex: 15
              }}
            />
          )}

          {/* Comments Display - Distributed across much larger canvas */}
          <div className="absolute inset-0">
            {comments.map((comment, index) => {
              // Generate positions across the much larger 8000x6000 canvas
              const positions = [
                { top: '5%', left: '10%' },
                { top: '15%', left: '75%' },
                { top: '25%', left: '30%' },
                { top: '12%', left: '90%' },
                { top: '35%', left: '15%' },
                { top: '45%', left: '80%' },
                { top: '30%', left: '60%' },
                { top: '55%', left: '25%' },
                { top: '20%', left: '50%' },
                { top: '65%', left: '70%' },
                { top: '8%', left: '40%' },
                { top: '40%', left: '5%' },
                { top: '75%', left: '20%' },
                { top: '28%', left: '95%' },
                { top: '85%', left: '45%' },
                { top: '92%', left: '75%' },
                { top: '50%', left: '85%' },
                { top: '18%', left: '2%' },
                { top: '70%', left: '95%' },
                { top: '3%', left: '65%' },
                { top: '60%', left: '10%' },
                { top: '38%', left: '75%' },
                { top: '80%', left: '55%' },
                { top: '48%', left: '35%' },
                { top: '90%', left: '15%' },
                { top: '58%', left: '90%' },
                { top: '22%', left: '20%' },
                { top: '68%', left: '40%' },
                { top: '95%', left: '85%' },
                { top: '42%', left: '65%' },
                { top: '78%', left: '8%' },
                { top: '32%', left: '45%' },
                { top: '88%', left: '30%' },
                { top: '52%', left: '95%' },
                { top: '2%', left: '80%' },
                { top: '62%', left: '25%' },
                { top: '72%', left: '60%' },
                { top: '82%', left: '90%' },
                { top: '6%', left: '35%' },
                { top: '96%', left: '50%' }
              ];
              
              const position = positions[index % positions.length];
              
              // Check if comment is within selection box
              const isCommentInSelection = selectionBox ? 
                (() => {
                  const commentX = (parseFloat(position.left.replace('%', '')) / 100) * canvasSize.width;
                  const commentY = (parseFloat(position.top.replace('%', '')) / 100) * canvasSize.height;
                  
                  return commentX >= selectionBox.x && 
                         commentX <= selectionBox.x + selectionBox.width &&
                         commentY >= selectionBox.y && 
                         commentY <= selectionBox.y + selectionBox.height;
                })() : false;
              
              const colors = [
                'border-red-300 bg-red-50 shadow-red-100', 
                'border-yellow-400 bg-yellow-50 shadow-yellow-100', 
                'border-red-400 bg-red-100 shadow-red-200'
              ];
              const colorClass = colors[index % colors.length];
              
              // Enhanced styling for selected comments
              const selectedStyle = isCommentInSelection ? 
                'border-green-500 bg-green-100 shadow-green-200 ring-4 ring-green-300 scale-110' : colorClass;
              
              return (
                <div
                  key={comment.id}
                  className={`absolute transform transition-all duration-500 hover:scale-105 comment-card pointer-events-auto`}
                  style={{ 
                    top: position.top, 
                    left: position.left,
                    animation: `fadeInBounce 0.8s ease-out ${index * 0.3}s both`,
                    zIndex: 10,
                    width: '450px',
                    maxWidth: 'none'
                  }}
                >
                  <div className={`p-8 rounded-3xl shadow-2xl border-3 ${selectedStyle} backdrop-blur-sm hover:shadow-3xl transition-all duration-500`}>
                    <div className="text-center mb-6">
                      <h3 className="font-bold text-3xl text-red-700 mb-3">{comment.name}</h3>
                      <div className="w-24 h-2 bg-gradient-to-r from-red-500 to-yellow-500 mx-auto rounded-full"></div>
                    </div>
                    <p className="text-gray-800 text-xl leading-relaxed italic font-medium text-center px-2">
                      "{comment.content}"
                    </p>
                    <div className="mt-6 text-center">
                      <span className="text-red-500 text-4xl">❤️🇻🇳✨</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Vietnamese Flag Elements - Distributed across canvas */}
          <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10">
            <div className="w-48 h-32 bg-red-600 relative rounded-2xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-yellow-400 text-6xl">⭐</span>
              </div>
            </div>
          </div>
          
          <div className="absolute top-3/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 opacity-8">
            <div className="w-32 h-20 bg-yellow-500 relative rounded-2xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-red-600 text-4xl">🏛️</span>
              </div>
            </div>
          </div>

          <div className="absolute top-1/2 right-1/4 transform translate-x-1/2 -translate-y-1/2 opacity-8">
            <div className="w-40 h-24 bg-red-500 relative rounded-2xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-yellow-400 text-5xl">🌟</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popup Form Modal */}
      {showPopupForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="text-center flex-1">
                  <h3 className="text-2xl font-bold text-red-600 mb-2">🇻🇳 Gửi Tâm Tình Của Bạn</h3>
                  <p className="text-gray-600 text-sm">Chia sẻ cảm xúc về Tổ quốc</p>
                </div>
                <button
                  onClick={() => setShowPopupForm(false)}
                  className="text-gray-500 hover:text-red-600 text-2xl font-bold p-2 hover:bg-red-50 rounded-full transition-colors"
                  title="Đóng form"
                >
                  ✕
                </button>
              </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Họ và Tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-red-400 focus:outline-none transition-colors text-sm"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mã Sinh Viên
                      </label>
                      <input
                        type="text"
                        name="studentId"
                        value={formData.studentId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none transition-colors text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-red-400 focus:outline-none transition-colors text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Khoa
                      </label>
                      <input
                        type="text"
                        name="faculty"
                        value={formData.faculty}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none transition-colors text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lớp
                      </label>
                      <input
                        type="text"
                        name="className"
                        value={formData.className}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-red-400 focus:outline-none transition-colors text-sm"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ảnh (không bắt buộc)
                      </label>
                      <input
                        type="file"
                        name="photo"
                        accept="image/*"
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none transition-colors text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nội dung <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-yellow-400 focus:outline-none transition-colors resize-vertical text-sm"
                      placeholder="Chia sẻ cảm xúc về Tổ quốc Việt Nam..."
                      required
                    ></textarea>
                  </div>
                  
                  <div className="text-center">
                    <Button 
                      type="submit"
                      className="bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-700 hover:to-yellow-600 text-white px-6 py-2 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      🇻🇳 Gửi Tâm Tình 🇻🇳
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes fadeInBounce {
            0% {
              opacity: 0;
              transform: translateY(30px) scale(0.8);
            }
            60% {
              opacity: 1;
              transform: translateY(-5px) scale(1.02);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          .comment-card {
            animation: fadeInBounce 0.8s ease-out both;
          }

          .comment-card:hover {
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          }

          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fade-in {
            animation: fade-in 0.5s ease-out;
          }

          /* Custom scrollbar for form area */
          ::-webkit-scrollbar {
            width: 6px;
          }

          ::-webkit-scrollbar-track {
            background: #f1f1f1;
          }

          ::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #ef4444, #eab308);
            border-radius: 3px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #dc2626, #d97706);
          }
        `}</style>
      </div>
    );
  }
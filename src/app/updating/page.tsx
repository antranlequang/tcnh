"use client";

import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { Wrench, Hammer, Cog, Sparkles, Clock, Heart, Coffee, Zap } from 'lucide-react';

export default function UpdatingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white-50 via-blue-100 to-white-50">
      <div className="container mx-auto px-4 py-16">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto text-center">

            {/* Main Icon with Bounce Animation */}
            <div className="mb-8">
              <div className="relative inline-block">
                <div className="animate-bounce">
                  <Wrench className="w-24 h-24 text-orange-500 mx-auto mb-4" />
                </div>
                <div className="absolute -top-2 -right-2 animate-ping">
                  <Sparkles className="w-8 h-8 text-red-500" />
                </div>
              </div>
            </div>

            {/* Main Title with Bounce */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text mb-6 animate-bounce">
                🚧 Opppsssss 🚧
              </h1>
              
              {/* Bouncing Message */}
              <div className="animate-bounce delay-100">
                <p className="text-xl md:text-2xl text-gray-700 font-medium leading-relaxed">
                  Chúng tớ đang cố gắng phát triển tính năng này thêm xịn xịn tí nữa,
                  <br />
                  <span className="text-orange-600 font-bold">bạn hãy ráng chờ thêm tí nữa nhaa</span>
                </p>
              </div>
            </div>

            {/* Animated Icons Grid */}
            <div className="grid grid-cols-4 gap-6 mb-12 max-w-md mx-auto">
              <div className="animate-bounce delay-200">
                <Hammer className="w-12 h-12 text-amber-500 mx-auto" />
              </div>
              <div className="animate-bounce delay-300">
                <Cog className="w-12 h-12 text-orange-500 mx-auto animate-spin-slow" />
              </div>
              <div className="animate-bounce delay-500">
                <Zap className="w-12 h-12 text-yellow-500 mx-auto" />
              </div>
              <div className="animate-bounce delay-700">
                <Coffee className="w-12 h-12 text-amber-600 mx-auto" />
              </div>
            </div>

            {/* Progress Bar Animation */}
            <div className="mb-12">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/30 shadow-xl">
                <div className="flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-orange-500 mr-2 animate-pulse" />
                  <span className="text-lg font-semibold text-gray-700">Tiến độ phát triển</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-4 rounded-full animate-pulse" 
                       style={{ width: '75%' }}></div>
                </div>
                
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Bắt đầu</span>
                  <span className="font-bold text-orange-600">75% Hoàn thành</span>
                  <span>Kết thúc</span>
                </div>
              </div>
            </div>

            {/* Bouncing Features List */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg animate-bounce delay-100">
                <div className="animate-spin-slow mb-4">
                  <Sparkles className="w-10 h-10 text-yellow-500 mx-auto" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Tính năng mới</h3>
                <p className="text-gray-600 text-sm">Đang phát triển những tính năng tuyệt vời</p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg animate-bounce delay-300">
                <div className="animate-pulse mb-4">
                  <Heart className="w-10 h-10 text-red-500 mx-auto" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Trải nghiệm tốt hơn</h3>
                <p className="text-gray-600 text-sm">Cải thiện giao diện và hiệu suất</p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/30 shadow-lg animate-bounce delay-500">
                <div className="animate-bounce mb-4">
                  <Zap className="w-10 h-10 text-blue-500 mx-auto" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Hiệu suất cao</h3>
                <p className="text-gray-600 text-sm">Tối ưu hóa tốc độ và độ ổn định</p>
              </div>
            </div>

            {/* Animated Message */}
            <div className="bg-gradient-to-r from-blue-100 to-blue-100 rounded-2xl p-8 border-2 border-blue-200 animate-pulse">
              <div className="flex items-center justify-center mb-4">
                <div className="animate-bounce">
                  <Coffee className="w-8 h-8 text-blue-600 mr-3" />
                </div>
                <h3 className="text-xl font-bold text-red-800">Chân thành cảm ơn vì sự chờ đợi của bạn</h3>
                <div className="animate-bounce delay-200">
                  <Heart className="w-8 h-8 text-blue-500 ml-3" />
                </div>
              </div>
              <p className="text-blue-700 leading-relaxed">
                Chúng tớ đang làm việc chăm chỉ để mang đến cho bạn những trải nghiệm tốt nhất.
                <br />
                <span className="font-semibold">Tính năng sẽ sớm được ra mắt thôi!</span>
              </p>
            </div>

            {/* Floating Elements */}
            <div className="fixed top-20 left-10 animate-bounce delay-1000 opacity-30">
              <Sparkles className="w-6 h-6 text-blue-400" />
            </div>
            <div className="fixed top-32 right-16 animate-bounce delay-1500 opacity-30">
              <Cog className="w-8 h-8 text-orange-400 animate-spin-slow" />
            </div>
            <div className="fixed bottom-20 left-20 animate-bounce delay-2000 opacity-30">
              <Hammer className="w-7 h-7 text-amber-500" />
            </div>
            <div className="fixed bottom-32 right-10 animate-bounce delay-2500 opacity-30">
              <Wrench className="w-6 h-6 text-orange-500" />
            </div>

          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
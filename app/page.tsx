'use client'

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Mic } from 'lucide-react';
import '@/styles/animations.css';

export default function VoiceChatUI() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 overflow-hidden page-transition" style={{
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.4s ease-out',
      width: '100vw',
      height: '100vh',
      background: '#000000'
    }}>
      {/* Earth Background Image - Raw, No Effects */}
      <div className="absolute inset-0">
        <img 
          src="/images/earth.png" 
          alt="Earth Background"
          className="w-full h-full object-cover"
          style={{ objectFit: 'cover' }}
        />
      </div>

      {/* Main Container */}
      <div className="relative w-full max-w-5xl z-10" style={{ marginTop: '60px' }}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-2">
            PropTalk
          </h1>
          <p className="text-2xl md:text-3xl lg:text-4xl text-blue-300">
            Get Your Voice Assistant
          </p>
        </div>

        {/* Chat Card */}
        <div className="relative rounded-3xl">
          {/* Outer Glow Layer */}
          <div className="absolute -inset-1 bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950 rounded-3xl opacity-30 blur-xl"></div>
          
          {/* Inner Card */}
          <div className="relative rounded-3xl border border-blue-800/30 p-8 md:p-12 backdrop-blur-sm" style={{
            background: '#121D3A',
            minHeight: '520px'
          }}>
            {/* Close Button */}
            <button className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-700/50 transition-colors">
              <X size={16} />
            </button>

            {/* Center Content */}
            <div className="flex flex-col items-center justify-center py-8">
              {/* Circular Image */}
              <div className="relative mb-6 fade-in-stagger-1">
                {/* Very Light Bluish Neon Glow Around Circle */}
                <div className="absolute inset-0 rounded-full" style={{
                  background: 'radial-gradient(circle, rgba(77, 184, 255, 0.08) 0%, rgba(77, 184, 255, 0.04) 40%, transparent 70%)',
                  filter: 'blur(25px)',
                  transform: 'scale(1.3)',
                  zIndex: -1,
                  animation: 'pulseGlow 3s ease-in-out infinite'
                }}></div>
                
                {/* Image Container */}
                <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden" style={{
                  boxShadow: '0 0 20px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(0, 0, 0, 0.4), 0 0 25px rgba(77, 184, 255, 0.15)',
                  border: '2px solid rgba(0, 0, 0, 0.5)',
                  padding: '3px'
                }}>
                  <div className="w-full h-full rounded-full overflow-hidden" style={{
                    border: '1px solid rgba(0, 0, 0, 0.3)'
                  }}>
                    <img 
                      src="/images/circular.png" 
                      alt="Circular"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Text */}
              <div className="text-center space-y-1 mb-6 fade-in-stagger-2">
                <p className="text-white text-lg md:text-xl font-medium">
                  I'm listening, Armando...
                </p>
                <p className="text-slate-400 text-base md:text-lg">
                  What's on your mind?
                </p>
              </div>

              {/* Control Buttons - Pill Shape */}
              <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-slate-800/80 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition-all mb-6 fade-in-stagger-3">
                {/* Close/Cancel Button */}
                <button className="w-9 h-9 rounded-full border border-slate-600 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-500 transition-all">
                  <X size={18} />
                </button>

                {/* Mic Button */}
                <button className="w-9 h-9 rounded-full border border-slate-600 flex items-center justify-center text-blue-400 hover:text-blue-300 hover:border-blue-500 transition-all">
                  <Mic size={18} />
                </button>
              </div>

              {/* Three Role Pills */}
              <div className="flex items-center gap-3">
                {/* User Pill */}
                <Link href="/login/user" className="no-underline">
                  <div className="px-8 py-2.5 rounded-full bg-slate-800/80 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition-all cursor-pointer fade-in-stagger-4">
                    <span className="text-white text-base font-medium">User</span>
                  </div>
                </Link>

                {/* Admin Pill */}
                <Link href="/login/admin" className="no-underline">
                  <div className="px-8 py-2.5 rounded-full bg-slate-800/80 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition-all cursor-pointer fade-in-stagger-5">
                    <span className="text-white text-base font-medium">Admin</span>
                  </div>
                </Link>

                {/* Agent Pill */}
                <Link href="/login/agent" className="no-underline">
                  <div className="px-8 py-2.5 rounded-full bg-slate-800/80 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition-all cursor-pointer fade-in-stagger-6">
                    <span className="text-white text-base font-medium">Agent</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

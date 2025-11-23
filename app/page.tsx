'use client'

import React from 'react'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          width: 100vw;
          height: 100vh;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }

        body {
          background: #000;
          font-family: 'Arial', sans-serif;
          position: relative;
        }

        .proptalk-svg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 100;
          pointer-events: none;
          margin: 0;
          padding: 0;
          overflow: visible;
          animation: fadeInSlide 1s ease-out;
        }

        .proptalk-svg text {
          fill: none;
          stroke: url(#neonGradient);
          stroke-width: 2;
          paint-order: stroke fill;
          filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.6)) drop-shadow(0 0 20px rgba(0, 255, 255, 0.3));
          animation: glow 2s ease-in-out infinite, floatHeading 6s ease-in-out infinite;
          font-size: clamp(70px, 18vw, 200px);
          letter-spacing: clamp(4px, 2.5vw, 15px);
        }

        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes floatHeading {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes glow {
          0%, 100% {
            filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.6)) drop-shadow(0 0 20px rgba(0, 255, 255, 0.3));
          }
          50% {
            filter: drop-shadow(0 0 20px rgba(0, 255, 255, 0.9)) drop-shadow(0 0 40px rgba(0, 255, 255, 0.6));
          }
        }

        .neon-particle {
          position: fixed;
          width: 4px;
          height: 4px;
          background: rgba(0, 255, 255, 0.8);
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.6);
          animation: floatParticle 15s ease-in-out infinite;
        }

        @keyframes floatParticle {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translate(100px, -150px) scale(1.5);
            opacity: 0.8;
          }
        }

        .neon-ray {
          position: fixed;
          width: 2px;
          height: 200px;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(0, 255, 255, 0.4) 50%,
            transparent 100%
          );
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.6);
          animation: rotateRay 20s linear infinite;
          transform-origin: bottom center;
        }

        @keyframes rotateRay {
          0% {
            transform: rotate(0deg);
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: rotate(360deg);
            opacity: 0.3;
          }
        }

        .neon-glow {
          position: fixed;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(0, 255, 255, 0.15) 0%,
            rgba(0, 153, 255, 0.1) 40%,
            transparent 70%
          );
          filter: blur(40px);
          animation: pulseGlow 8s ease-in-out infinite;
        }

        @keyframes pulseGlow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.7;
          }
        }

        .subtitle-container {
          position: fixed;
          top: clamp(100px, 18vh, 240px);
          left: clamp(15px, 4vw, 50px);
          right: clamp(15px, 4vw, 50px);
          z-index: 100;
          pointer-events: none;
          animation: fadeInSlideSubtitle 1.2s ease-out 0.3s both;
        }

        .subtitle-text {
          font-size: clamp(20px, 5vw, 100px);
          font-weight: 700;
          font-family: 'Arial', sans-serif;
          color: #ffffff;
          position: relative;
          z-index: 2;
          text-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
          font-style: italic;
          display: inline-block;
          animation: floatSubtitle 6s ease-in-out infinite 1.5s;
          line-height: 1.3;
        }

        @keyframes fadeInSlideSubtitle {
          from {
            opacity: 0;
            transform: translateY(-15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes floatSubtitle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        .subtitle-mirror {
          font-size: clamp(20px, 5vw, 100px);
          font-weight: 700;
          font-family: 'Arial', sans-serif;
          background: linear-gradient(135deg, #00ffff 0%, #0099ff 50%, #00ffff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 1;
          opacity: 0.5;
          transform: translateY(6px) scaleY(0.9);
          filter: blur(2px);
          font-style: italic;
          display: inline-block;
          white-space: nowrap;
          line-height: 1.3;
        }

        .tile-container {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: row;
          gap: clamp(15px, 3vw, 40px);
          z-index: 100;
          pointer-events: auto;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          padding: 0 clamp(15px, 4vw, 20px);
          width: 100%;
          max-width: 700px;
        }

        .rounded-tile {
          width: clamp(120px, 28vw, 200px);
          height: clamp(80px, 18vw, 120px);
          border-radius: clamp(8px, 2vw, 15px);
          border: 2px solid #0099ff;
          background: rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          opacity: 0;
          animation: fadeInStagger 0.8s ease-out forwards;
          flex-shrink: 0;
        }

        .rounded-tile:nth-child(1) {
          animation-delay: 0.2s;
        }

        .rounded-tile:nth-child(2) {
          animation-delay: 0.4s;
        }

        .rounded-tile:nth-child(3) {
          animation-delay: 0.6s;
        }

        @keyframes fadeInStagger {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .rounded-tile:hover {
          border-color: #00ffff;
          background: rgba(0, 0, 0, 0.5);
          transform: scale(1.05) translateY(-8px);
        }

        .tile-text {
          font-size: clamp(14px, 3vw, 24px);
          font-weight: 700;
          font-family: 'Arial', sans-serif;
          color: #ffffff;
          text-align: center;
          padding: 0 10px;
        }

        @media (max-width: 768px) {
          .tile-container {
            flex-direction: column;
            gap: 15px;
            top: 55%;
            max-width: 90%;
          }

          .subtitle-container {
            top: 22%;
            left: 15px;
            right: 15px;
          }

          .subtitle-text {
            font-size: clamp(22px, 6vw, 32px);
          }

          .subtitle-mirror {
            font-size: clamp(22px, 6vw, 32px);
          }

          .proptalk-svg text {
            font-size: clamp(70px, 16vw, 140px);
            letter-spacing: clamp(4px, 2vw, 12px);
          }

          .rounded-tile {
            width: clamp(200px, 70vw, 280px);
            height: 70px;
            flex-shrink: 0;
          }

          .tile-text {
            font-size: clamp(16px, 4vw, 20px);
          }

          .neon-glow {
            width: clamp(150px, 40vw, 250px);
            height: clamp(150px, 40vw, 250px);
          }

          .neon-ray {
            width: 1.5px;
            height: clamp(100px, 25vh, 150px);
          }

          .neon-particle {
            width: 3px;
            height: 3px;
          }
        }

        @media (max-width: 480px) {
          .tile-container {
            top: 58%;
            gap: 12px;
            max-width: 85%;
          }

          .rounded-tile {
            width: clamp(180px, 75vw, 260px);
            height: 65px;
          }

          .tile-text {
            font-size: clamp(15px, 4vw, 18px);
          }

          .subtitle-container {
            top: 20%;
            left: 12px;
            right: 12px;
          }

          .subtitle-text {
            font-size: clamp(20px, 5.5vw, 28px);
          }

          .subtitle-mirror {
            font-size: clamp(20px, 5.5vw, 28px);
          }

          .proptalk-svg text {
            font-size: clamp(65px, 15vw, 120px);
            letter-spacing: clamp(3px, 2vw, 10px);
          }
        }
      `}</style>

      {/* PROPTALK Text */}
      <svg className="proptalk-svg" viewBox="0 0 1920 1080" preserveAspectRatio="none">
        <defs>
          <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#00ffff', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#0099ff', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#00ffff', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <text x="50" y="200" textAnchor="start" fontWeight="900" fontFamily="Arial, sans-serif">
          PROPTALK
        </text>
      </svg>

      {/* Subtitle with Mirror Effect */}
      <div className="subtitle-container">
        <div className="subtitle-text">Get Your Voice Agent Now!</div>
        <div className="subtitle-mirror">Get Your Voice Agent Now!</div>
      </div>

      {/* Three Rounded Square Tiles */}
      <div className="tile-container">
        <Link href="/login/admin" style={{ textDecoration: 'none' }}>
          <div className="rounded-tile">
            <div className="tile-text">Admin</div>
          </div>
        </Link>
        <Link href="/login/agent" style={{ textDecoration: 'none' }}>
          <div className="rounded-tile">
            <div className="tile-text">Real Estate</div>
          </div>
        </Link>
        <Link href="/login/user" style={{ textDecoration: 'none' }}>
          <div className="rounded-tile">
            <div className="tile-text">User</div>
          </div>
        </Link>
      </div>

      {/* Bluish Neon Background Effects - Balanced Distribution */}
      {/* Glows - Evenly spaced across entire page */}
      <div className="neon-glow" style={{ top: '15%', left: '12%', animationDelay: '0s' }}></div>
      <div className="neon-glow" style={{ top: '35%', left: '35%', animationDelay: '2s' }}></div>
      <div className="neon-glow" style={{ top: '55%', left: '18%', animationDelay: '4s' }}></div>
      <div className="neon-glow" style={{ top: '75%', left: '42%', animationDelay: '1s' }}></div>
      <div className="neon-glow" style={{ top: '25%', left: '58%', animationDelay: '3s' }}></div>
      <div className="neon-glow" style={{ top: '65%', left: '68%', animationDelay: '5s' }}></div>
      <div className="neon-glow" style={{ top: '45%', left: '82%', animationDelay: '0s' }}></div>
      <div className="neon-glow" style={{ top: '20%', left: '88%', animationDelay: '2s' }}></div>
      <div className="neon-glow" style={{ top: '60%', left: '92%', animationDelay: '4s' }}></div>
      
      {/* Rays - Balanced distribution */}
      <div className="neon-ray" style={{ top: '20%', left: '22%', animationDelay: '0s' }}></div>
      <div className="neon-ray" style={{ top: '50%', left: '45%', animationDelay: '3s' }}></div>
      <div className="neon-ray" style={{ top: '80%', left: '28%', animationDelay: '6s' }}></div>
      <div className="neon-ray" style={{ top: '30%', left: '62%', animationDelay: '9s' }}></div>
      <div className="neon-ray" style={{ top: '70%', left: '52%', animationDelay: '2s' }}></div>
      <div className="neon-ray" style={{ top: '15%', left: '75%', animationDelay: '5s' }}></div>
      <div className="neon-ray" style={{ top: '55%', left: '78%', animationDelay: '8s' }}></div>
      <div className="neon-ray" style={{ top: '40%', left: '85%', animationDelay: '1s' }}></div>
      <div className="neon-ray" style={{ top: '25%', left: '92%', animationDelay: '4s' }}></div>
      <div className="neon-ray" style={{ top: '65%', left: '88%', animationDelay: '7s' }}></div>
      
      {/* Particles - Evenly distributed */}
      <div className="neon-particle" style={{ top: '18%', left: '15%', animationDelay: '0s' }}></div>
      <div className="neon-particle" style={{ top: '38%', left: '28%', animationDelay: '2s' }}></div>
      <div className="neon-particle" style={{ top: '58%', left: '12%', animationDelay: '4s' }}></div>
      <div className="neon-particle" style={{ top: '28%', left: '48%', animationDelay: '6s' }}></div>
      <div className="neon-particle" style={{ top: '68%', left: '38%', animationDelay: '8s' }}></div>
      <div className="neon-particle" style={{ top: '48%', left: '55%', animationDelay: '10s' }}></div>
      <div className="neon-particle" style={{ top: '78%', left: '65%', animationDelay: '12s' }}></div>
      <div className="neon-particle" style={{ top: '22%', left: '72%', animationDelay: '14s' }}></div>
      <div className="neon-particle" style={{ top: '52%', left: '82%', animationDelay: '1s' }}></div>
      <div className="neon-particle" style={{ top: '32%', left: '88%', animationDelay: '3s' }}></div>
      <div className="neon-particle" style={{ top: '62%', left: '92%', animationDelay: '5s' }}></div>
      <div className="neon-particle" style={{ top: '42%', left: '95%', animationDelay: '7s' }}></div>
      <div className="neon-particle" style={{ top: '72%', left: '85%', animationDelay: '9s' }}></div>
      <div className="neon-particle" style={{ top: '15%', left: '78%', animationDelay: '11s' }}></div>
      <div className="neon-particle" style={{ top: '35%', left: '58%', animationDelay: '13s' }}></div>
      <div className="neon-particle" style={{ top: '55%', left: '68%', animationDelay: '15s' }}></div>
    </>
  )
}
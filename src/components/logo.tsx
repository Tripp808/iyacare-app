import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps = {}) {
  return (
    <Link href="/" className="flex items-center space-x-3">
      <div className={cn("relative", className)}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main circle background with clean gradient */}
          <circle cx="20" cy="20" r="19" fill="url(#mainGradient)"/>
          
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2D7D89"/>
              <stop offset="100%" stopColor="#1F5F68"/>
            </linearGradient>
            <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B7A"/>
              <stop offset="100%" stopColor="#E74C3C"/>
            </linearGradient>
          </defs>
          
          {/* Mother figure - clean and simple */}
          <circle cx="14" cy="13" r="3.5" fill="#ffffff"/>
          <ellipse cx="14" cy="20" rx="4" ry="6" fill="#ffffff"/>
          
          {/* Child figure - clean and simple */}
          <circle cx="26" cy="15" r="2.5" fill="#F7913D"/>
          <ellipse cx="26" cy="21" rx="3" ry="4.5" fill="#F7913D"/>
          
          {/* Heart symbol - clean and centered */}
          <path 
            d="M20 18c-1.5-1.8-4-1.8-4 1.2c0 2.8 4 6 4 6s4-3.2 4-6c0-3-2.5-3-4-1.2z" 
            fill="url(#heartGradient)"
          />
        </svg>
      </div>
      <div className="text-xl font-bold tracking-tight">
          <span className="text-[#2D7D89]">Iyà</span>
          <span className="text-[#F7913D]">Care</span>
      </div>
    </Link>
  );
}

export function LogoSmall() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <div className="relative">
        <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main circle background with clean gradient */}
          <circle cx="20" cy="20" r="19" fill="url(#mainGradientSmall)"/>
          
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="mainGradientSmall" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2D7D89"/>
              <stop offset="100%" stopColor="#1F5F68"/>
            </linearGradient>
            <linearGradient id="heartGradientSmall" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B7A"/>
              <stop offset="100%" stopColor="#E74C3C"/>
            </linearGradient>
          </defs>
          
          {/* Mother figure - clean and simple */}
          <circle cx="14" cy="13" r="3.5" fill="#ffffff"/>
          <ellipse cx="14" cy="20" rx="4" ry="6" fill="#ffffff"/>
          
          {/* Child figure - clean and simple */}
          <circle cx="26" cy="15" r="2.5" fill="#F7913D"/>
          <ellipse cx="26" cy="21" rx="3" ry="4.5" fill="#F7913D"/>
          
          {/* Heart symbol - clean and centered */}
          <path 
            d="M20 18c-1.5-1.8-4-1.8-4 1.2c0 2.8 4 6 4 6s4-3.2 4-6c0-3-2.5-3-4-1.2z" 
            fill="url(#heartGradientSmall)"
          />
        </svg>
      </div>
      <div className="text-sm font-bold">
        <span className="text-[#2D7D89]">Iyà</span>
        <span className="text-[#F7913D]">Care</span>
      </div>
    </Link>
  );
} 
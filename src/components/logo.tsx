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
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="motherGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2D7D89"/>
              <stop offset="100%" stopColor="#4AA0AD"/>
            </linearGradient>
            <linearGradient id="childGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F7913D"/>
              <stop offset="100%" stopColor="#E67C3B"/>
            </linearGradient>
          </defs>
          
          {/* Mother figure - larger, more detailed silhouette */}
          <g fill="url(#motherGradient)">
            {/* Mother's head */}
            <circle cx="15" cy="10" r="3.5"/>
            {/* Mother's body - curved path for more realistic shape */}
            <path d="M15 15c-4 0-7 2.5-7 8v12c0 1 0.5 1.5 1.5 1.5h11c1 0 1.5-0.5 1.5-1.5V23c0-5.5-3-8-7-8z"/>
            {/* Mother's arms - embracing gesture */}
            <ellipse cx="10" cy="20" rx="2" ry="6" transform="rotate(-15 10 20)"/>
            <ellipse cx="20" cy="20" rx="2" ry="6" transform="rotate(15 20 20)"/>
          </g>
          
          {/* Child figure - smaller, positioned in front/side of mother */}
          <g fill="url(#childGradient)">
            {/* Child's head */}
            <circle cx="25" cy="16" r="2.5"/>
            {/* Child's body */}
            <path d="M25 20c-2.5 0-4.5 2-4.5 6v8c0 0.5 0.3 1 1 1h7c0.7 0 1-0.5 1-1v-8c0-4-2-6-4.5-6z"/>
          </g>
          
          {/* Heart symbol connecting them */}
          <path 
            d="M18 12c-0.8-1.2-2.5-1.2-2.5 0.8c0 1.8 2.5 4 2.5 4s2.5-2.2 2.5-4c0-2-1.7-2-2.5-0.8z" 
            fill="#ffffff" 
            opacity="0.9"
          />
        </svg>
      </div>
      <div className="text-xl font-bold tracking-tight">
          <span className="text-[#2D7D89] dark:text-[#4AA0AD]">Iyà</span>
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
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="motherGradientSmall" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2D7D89"/>
              <stop offset="100%" stopColor="#4AA0AD"/>
            </linearGradient>
            <linearGradient id="childGradientSmall" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F7913D"/>
              <stop offset="100%" stopColor="#E67C3B"/>
            </linearGradient>
          </defs>
          
          {/* Mother figure - larger, more detailed silhouette */}
          <g fill="url(#motherGradientSmall)">
            {/* Mother's head */}
            <circle cx="15" cy="10" r="3.5"/>
            {/* Mother's body - curved path for more realistic shape */}
            <path d="M15 15c-4 0-7 2.5-7 8v12c0 1 0.5 1.5 1.5 1.5h11c1 0 1.5-0.5 1.5-1.5V23c0-5.5-3-8-7-8z"/>
            {/* Mother's arms - embracing gesture */}
            <ellipse cx="10" cy="20" rx="2" ry="6" transform="rotate(-15 10 20)"/>
            <ellipse cx="20" cy="20" rx="2" ry="6" transform="rotate(15 20 20)"/>
          </g>
          
          {/* Child figure - smaller, positioned in front/side of mother */}
          <g fill="url(#childGradientSmall)">
            {/* Child's head */}
            <circle cx="25" cy="16" r="2.5"/>
            {/* Child's body */}
            <path d="M25 20c-2.5 0-4.5 2-4.5 6v8c0 0.5 0.3 1 1 1h7c0.7 0 1-0.5 1-1v-8c0-4-2-6-4.5-6z"/>
          </g>
          
          {/* Heart symbol connecting them */}
          <path 
            d="M18 12c-0.8-1.2-2.5-1.2-2.5 0.8c0 1.8 2.5 4 2.5 4s2.5-2.2 2.5-4c0-2-1.7-2-2.5-0.8z" 
            fill="#ffffff" 
            opacity="0.9"
          />
        </svg>
      </div>
      <div className="text-sm font-bold">
        <span className="text-[#2D7D89] dark:text-[#4AA0AD]">Iyà</span>
        <span className="text-[#F7913D]">Care</span>
      </div>
    </Link>
  );
} 
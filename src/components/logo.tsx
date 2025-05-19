import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps = {}) {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <div className={cn("relative flex items-center", className)}>
        <svg width="40" height="40" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Circle head */}
          <circle cx="150" cy="90" r="40" fill="#2D7D89" />
          
          {/* Heart shape */}
          <path 
            d="M150 140C180 110 220 130 220 170C220 210 150 250 150 250C150 250 80 210 80 170C80 130 120 110 150 140Z" 
            fill="#2D7D89" 
          />
          
          {/* Child figure - circle */}
          <circle cx="130" cy="180" r="20" fill="#F7913D" />
          
          {/* Parent/caregiver figure */}
          <path 
            d="M160 160C180 170 200 200 190 240C180 280 150 290 150 290C150 290 170 230 160 200C150 170 160 160 160 160Z" 
            fill="#F7913D" 
          />
        </svg>
        
        <span className="ml-2 text-2xl font-bold">
          <span className="text-[#2D7D89]">Iyà</span>
          <span className="text-[#F7913D]">Care</span>
        </span>
      </div>
    </Link>
  );
}

export function LogoSmall() {
  return (
    <Link href="/" className="flex items-center">
      <div className="relative">
        <svg width="32" height="32" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Circle head */}
          <circle cx="150" cy="90" r="40" fill="#2D7D89" />
          
          {/* Heart shape */}
          <path 
            d="M150 140C180 110 220 130 220 170C220 210 150 250 150 250C150 250 80 210 80 170C80 130 120 110 150 140Z" 
            fill="#2D7D89" 
          />
          
          {/* Child figure - circle */}
          <circle cx="130" cy="180" r="20" fill="#F7913D" />
          
          {/* Parent/caregiver figure */}
          <path 
            d="M160 160C180 170 200 200 190 240C180 280 150 290 150 290C150 290 170 230 160 200C150 170 160 160 160 160Z" 
            fill="#F7913D" 
          />
        </svg>
      </div>
    </Link>
  );
} 
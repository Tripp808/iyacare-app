'use client';

import Link from "next/link";
import { Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/" className="flex items-center">
              <div>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Gradient definitions */}
                  <defs>
                    <linearGradient id="motherGradientFooter" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2D7D89"/>
                      <stop offset="100%" stopColor="#4AA0AD"/>
                    </linearGradient>
                    <linearGradient id="childGradientFooter" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F7913D"/>
                      <stop offset="100%" stopColor="#E67C3B"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Mother figure - larger, more detailed silhouette */}
                  <g fill="url(#motherGradientFooter)">
                    {/* Mother's head */}
                    <circle cx="15" cy="10" r="3.5"/>
                    {/* Mother's body - curved path for more realistic shape */}
                    <path d="M15 15c-4 0-7 2.5-7 8v12c0 1 0.5 1.5 1.5 1.5h11c1 0 1.5-0.5 1.5-1.5V23c0-5.5-3-8-7-8z"/>
                    {/* Mother's arms - embracing gesture */}
                    <ellipse cx="10" cy="20" rx="2" ry="6" transform="rotate(-15 10 20)"/>
                    <ellipse cx="20" cy="20" rx="2" ry="6" transform="rotate(15 20 20)"/>
                  </g>
                  
                  {/* Child figure - smaller, positioned in front/side of mother */}
                  <g fill="url(#childGradientFooter)">
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
              <span className="ml-2 text-2xl font-bold font-geist">
                <span className="text-[#2D7D89]">Iyà</span>
                <span className="text-[#F7913D]">Care</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground text-center md:text-left font-geist">
              Smart Care for Every Mother, Everywhere.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-[#2D7D89] dark:hover:text-[#4AA0AD] transition-colors">
                <Instagram size={18} />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <p className="text-sm text-muted-foreground mb-2 font-geist">
              &copy; {new Date().getFullYear()} IyàCare. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href="/terms" className="text-muted-foreground hover:text-[#2D7D89] dark:hover:text-[#4AA0AD] transition-colors font-geist">
                Terms
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-[#2D7D89] dark:hover:text-[#4AA0AD] transition-colors font-geist">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 
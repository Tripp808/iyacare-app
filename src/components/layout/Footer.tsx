'use client';

import Link from "next/link";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/" className="flex items-center">
              <div>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Main circle background with clean gradient */}
                  <circle cx="20" cy="20" r="19" fill="url(#mainGradientFooter)"/>
                  
                  {/* Gradient definitions */}
                  <defs>
                    <linearGradient id="mainGradientFooter" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2D7D89"/>
                      <stop offset="100%" stopColor="#1F5F68"/>
                    </linearGradient>
                    <linearGradient id="heartGradientFooter" x1="0%" y1="0%" x2="100%" y2="100%">
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
                    fill="url(#heartGradientFooter)"
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
                <Facebook size={18} />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-[#2D7D89] dark:hover:text-[#4AA0AD] transition-colors">
                <Twitter size={18} />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-[#2D7D89] dark:hover:text-[#4AA0AD] transition-colors">
                <Instagram size={18} />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-[#2D7D89] dark:hover:text-[#4AA0AD] transition-colors">
                <Linkedin size={18} />
                <span className="sr-only">LinkedIn</span>
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
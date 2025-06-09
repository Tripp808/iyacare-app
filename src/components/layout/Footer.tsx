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
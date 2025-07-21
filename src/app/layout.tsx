import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { MainLayout } from "@/components/layout/MainLayout";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/useAuth";
import { NotificationProvider } from "@/hooks/useNotifications";

export const metadata = {
  title: "IyàCare - AI-Powered Maternal Health Monitoring Platform",
  description: "Transforming maternal healthcare in low-resource settings with AI risk prediction, real-time IoT monitoring, and blockchain record keeping. Smart care for every mother, everywhere.",
  keywords: "maternal health, pregnancy monitoring, AI healthcare, IoT devices, blockchain records, rural healthcare, maternal mortality",
  authors: [{ name: "IyàCare Team" }],
  creator: "IyàCare",
  publisher: "IyàCare",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/favicon.svg", sizes: "180x180", type: "image/svg+xml" }
    ],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2D7D89" },
    { media: "(prefers-color-scheme: dark)", color: "#4AA0AD" }
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={GeistSans.variable}>
      <body className={`${GeistSans.className} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <AuthProvider>
            <NotificationProvider>
              <MainLayout>{children}</MainLayout>
              <Toaster />
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

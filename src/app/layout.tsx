import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { MainLayout } from "@/components/layout/MainLayout";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/useAuth";
import { NotificationProvider } from "@/hooks/useNotifications";

export const metadata = {
  title: "IyàCare - Maternal Health Platform",
  description: "Smart Care for Every Mother, Everywhere",
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

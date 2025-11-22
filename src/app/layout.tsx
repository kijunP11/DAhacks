import type { Metadata } from "next";
import { Russo_One, Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/auth/user-state";
import { Sidebar } from "@/components/sidebar";

const russoOne = Russo_One({
  weight: "400",
  variable: "--font-russo-one",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WattGuard - Smart Electricity Bill Analyzer",
  description: "Analyze your electricity bill, track usage, and get personalized saving tips.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${russoOne.variable} ${inter.variable} ${outfit.variable} font-sans antialiased bg-[#F4F6F8]`}
      >
        <AuthProvider>
          <div className="flex min-h-screen">
            {/* Sidebar: Fixed width 260px */}
            <Sidebar />
            
            {/* Main Content: Offset by sidebar width */}
            <main className="flex-1 ml-[260px]">
          {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

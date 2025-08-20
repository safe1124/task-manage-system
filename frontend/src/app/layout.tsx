import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import HeaderClient from "@/components/HeaderClient";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "タスク管理",
  description: "大学生活のタスクをスマートに管理",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased text-white bg-[#0b1b3b]`}>
        <HeaderClient />
        <main className="max-w-5xl mx-auto">{children}</main>
      </body>
    </html>
  );
}

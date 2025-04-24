import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import StripeProvider from "./components/StripeProvider";
import ClientHeader from "./components/ClientHeader";
import ClientFooter from "./components/ClientFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Keepsake - Turn Listings into Coloring Pages",
  description: "Transform your real estate listings into beautiful, hand-crafted coloring pages for children and families.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider>
          <StripeProvider>
            <div className="min-h-screen flex flex-col">
              <ClientHeader />
              <main className="flex-grow">
                {children}
              </main>
              <ClientFooter />
            </div>
          </StripeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

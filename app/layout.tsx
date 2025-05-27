import type { Metadata } from "next";
import { Poppins, DM_Sans } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import Smooth from "@/components/Smooth";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

const dmsans = DM_Sans({
  variable: "--font-dmsans",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Fix It Today",
  description: "3D printing and 3D modeling services for your needs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-initializer" strategy="beforeInteractive">
          {`
            (function() {
              const root = document.documentElement;
              try {
                const savedTheme = localStorage.getItem('theme');
                if (savedTheme) {
                  if (savedTheme === 'dark') {
                    root.classList.add('dark');
                  } else {
                    root.classList.remove('dark');
                  }
                } else {
                  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    root.classList.add('dark');
                    localStorage.setItem('theme', 'dark');
                  } else {
                    root.classList.remove('dark');
                    localStorage.setItem('theme', 'light');
                  }
                }
              } catch (error) {
                console.error('Error applying initial theme:', error);
              }
            })();
          `}
        </Script>
      </head>
      <body
        className={`${poppins.variable} ${dmsans.variable} antialiased`}
      >
        <Smooth>
          <Navbar />
          {children}
        </Smooth>
      </body>
    </html>
  );
}

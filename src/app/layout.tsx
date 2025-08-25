import type { Metadata } from "next";
import { 
  Geist, 
  Geist_Mono, 
  JetBrains_Mono,
  Instrument_Serif,
  Instrument_Sans,
  Urbanist,
  Bricolage_Grotesque 
} from "next/font/google";
import "./globals.css";
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage-grotesque",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Inventory Management",
  description: "Modern inventory management system with beautiful UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} ${instrumentSans.variable} ${urbanist.variable} ${bricolageGrotesque.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-center" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}

import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner"


const inter = Inter({ subsets: ["latin"] });
const APP_NAME = "Gasbee";
const APP_DEFAULT_TITLE = "Gasbee";
const APP_TITLE_TEMPLATE = "%s - Gasbee";
const APP_DESCRIPTION = "Gasbee is a powerful employee management platform offering solutions for attendance tracking, payroll management, and performance analytics to streamline HR processes and boost productivity.";
const APP_KEYWORDS = "employee management, attendance tracking, payroll management, performance analytics, HR solutions, gasbee";
const APP_AUTHOR = "John Loyd Belen";
const APP_URL = "https://gasbee.aap-h.com";
const APP_IMAGE = "/images/gasbee-logo.png";

export const metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  keywords: APP_KEYWORDS,
  author: APP_AUTHOR,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    url: APP_URL,
    images: [
      {
        url: APP_IMAGE,
        width: 800,
        height: 600,
        alt: "Gasbee Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
    images: [APP_IMAGE],
  },
  robots: "index, follow",
  canonical: APP_URL,
};

export const viewport = {
  themeColor: "#FFFFFF",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

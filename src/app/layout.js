import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] });
const APP_NAME = "Gasbee";
const APP_DEFAULT_TITLE = "Gasbee - Employee Management Platform";
const APP_TITLE_TEMPLATE = "%s - Gasbee";
const APP_DESCRIPTION = "Gasbee is a comprehensive employee management platform designed to simplify HR processes with advanced solutions for attendance tracking, payroll management, and performance analytics. Boost productivity and streamline operations effortlessly.";
const APP_KEYWORDS = "employee management, HR software, attendance tracking, payroll management, performance analytics, workforce management, HR automation, Gasbee solutions";
const APP_AUTHOR = "John Loyd Belen";
const APP_URL = "https://aap-h.com";
const APP_IMAGE = "/Logo2.png";

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
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    locale: "en_US", // Specify locale for OpenGraph
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
        alt: "Gasbee Logo - Employee Management Platform",
      },
    ],
  },
  robots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1", // Enhanced robots tag for better control
  canonical: APP_URL,
  structuredData: {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: APP_NAME,
    description: APP_DESCRIPTION,
    author: {
      "@type": "Person",
      name: APP_AUTHOR,
    },
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: APP_URL,
    image: APP_IMAGE,
    keywords: APP_KEYWORDS,
  },
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

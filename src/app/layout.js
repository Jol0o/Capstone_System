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
const APP_IMAGE = "https://res.cloudinary.com/dkibnftac/image/upload/v1732347968/Logo2_rburxq.png";

export const metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: "Gasbee simplifies HR processes with advanced solutions for attendance tracking, payroll management, and workforce analytics.",
  keywords: "HR platform, employee management software, Gasbee, workforce automation, payroll solutions",
  author: APP_AUTHOR,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gasbee - HR Simplified",
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: "Gasbee - Transform HR Processes",
    description: APP_DESCRIPTION,
    url: APP_URL,
    images: [
      {
        url: APP_IMAGE,
        width: 1200,
        height: 630,
        alt: "Gasbee HR Software",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gasbee - Transform HR Processes",
    description: APP_DESCRIPTION,
    image: APP_IMAGE,
  },
  structuredData: [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: APP_NAME,
      description: APP_DESCRIPTION,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: APP_URL,
      image: APP_IMAGE,
      keywords: APP_KEYWORDS,
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Gasbee",
      url: APP_URL,
      logo: APP_IMAGE,
      description: "A trusted platform for employee and HR management.",
    },
  ],
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

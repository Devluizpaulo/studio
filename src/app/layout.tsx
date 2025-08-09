import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { db } from "@/lib/firebase-admin";
import Script from "next/script";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-body",
});


interface OfficeSettings {
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
  };
  gtmId?: string;
}

// Function to get the first office settings from the database
async function getOfficeSettings(): Promise<OfficeSettings | null> {
  if (!db) {
    console.warn("Firebase Admin (db) is not initialized. Skipping getOfficeSettings. This is expected if server-side credentials are not set.");
    return null;
  }
  try {
    // This is a simplified approach. In a multi-tenant app,
    // you'd determine the office based on the domain or another identifier.
    // Here, we just grab the first one we find for demonstration.
    const officeSnapshot = await db.collection("offices").limit(1).get();
    if (officeSnapshot.empty) {
      return null;
    }
    const officeData = officeSnapshot.docs[0].data();
    return {
      seo: officeData.seo,
      gtmId: officeData.gtmId,
    };
  } catch (error) {
    console.error("Error fetching office settings for layout. This can happen if server credentials are not set correctly. Using default settings.", error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getOfficeSettings();
  
  const defaultTitle = "JurisAI";
  const defaultDescription = "A plataforma inteligente para gestão jurídica.";

  return {
    title: settings?.seo?.metaTitle || defaultTitle,
    description: settings?.seo?.metaDescription || defaultDescription,
    keywords: settings?.seo?.metaKeywords || "",
  };
}

export const viewport: Viewport = {
  themeColor: "hsl(var(--background))",
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getOfficeSettings();

  return (
    <html lang="pt-BR" suppressHydrationWarning>
       {settings?.gtmId && (
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${settings.gtmId}');
            `}
          </Script>
        )}
      <body
        className={cn(
          "min-h-screen bg-background font-body antialiased",
          poppins.variable
        )}
      >
         {settings?.gtmId && (
            <noscript
              dangerouslySetInnerHTML={{
                __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${settings.gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
              }}
            />
          )}
        <AuthProvider>
          <SidebarProvider>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

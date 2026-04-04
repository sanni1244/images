import { Figtree } from "next/font/google";
import "./globals.css";

const inter = Figtree({ subsets: ["latin"] });

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = "en";
  return (
    <html lang={locale} suppressHydrationWarning>
      <head></head>
      <body className={`${inter.className} min-h-screen overflow-auto`}>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}

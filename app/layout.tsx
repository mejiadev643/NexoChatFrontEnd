import type { Metadata } from "next";
import "./globals.css";
import HydrationWrapper from "@/components/hydration-wrapper";

export const metadata: Metadata = {
  title: "Nexo Chat",
  description: "A real-time chat application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <HydrationWrapper>
          {children}
        </HydrationWrapper>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Product Gateway",
  description: "Routes traffic to web/admin/reporting apps",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

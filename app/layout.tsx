import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Screen Time Calculator",
  description: "Add up the minutes you spent on each kind of app today.",
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

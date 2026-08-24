import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chambers — A cell for men to fight the noonday demon",
  description:
    "A daily rule of life, prayer, and brotherhood app built around the desert fathers' discipline of praktike.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

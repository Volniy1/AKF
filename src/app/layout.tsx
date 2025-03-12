import type { Metadata } from "next";
import { Exo_2 } from "next/font/google";
import "./globals.css";

const Exo = Exo_2({
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "A.K.F.",
  description: "Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${Exo.className} ${Exo.className}`}>{children}</body>
    </html>
  );
}

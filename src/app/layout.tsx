import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "nazm — Where dreams rise through the silence",
  description:
    "A personal poetry platform for publishing poems and recitation videos, organized by poet and category.",
  keywords: ["poetry", "poems", "recitation", "nazm", "literature"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full antialiased">
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}

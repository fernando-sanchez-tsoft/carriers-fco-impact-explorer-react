import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CARRIERS · Mapa de impacto FCO",
  description:
    "Explorador interactivo de pantallas Oracle Forms e impactos sobre tablas.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}

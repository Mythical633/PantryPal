"use client"

import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>PantryGo: Pantry Management on the Go!</title>
        <meta author="Sivaibala" />
      </head>
      <body className={inter.className}>{children}
      </body>
      <Analytics/>
    </html>
  );
}

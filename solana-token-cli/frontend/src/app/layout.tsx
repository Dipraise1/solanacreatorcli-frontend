import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Solana Token Deployer",
  description: "A public deployer for Solana SPL tokens with Raydium integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 text-white min-h-screen`}>
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
      </body>
    </html>
  );
}

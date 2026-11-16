import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TIKCAST LIVE — Run TikTok Like a TV Channel",
  description:
    "Playout. Split-Screen. DJ Radio. Movie Mode. Safety Net. The broadcast studio for TikTok creators.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[var(--bg)] text-[var(--text)]">
        {children}
      </body>
    </html>
  );
}

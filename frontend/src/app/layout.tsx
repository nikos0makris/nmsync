import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gym Tracker",
  description: "Exercise tracker with Supabase and FastAPI"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

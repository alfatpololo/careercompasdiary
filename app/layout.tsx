import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";

export const metadata: Metadata = {
  title: "Career Compass Diary",
  description: "Temukan jalur karier yang tepat untuk masa depanmu dengan quiz interaktif",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning={true}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

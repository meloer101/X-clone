import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "X Clone",
  description: "A Twitter/X clone built with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          {children}
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: "#1d9bf0",
                color: "#fff",
                borderRadius: "9999px",
                padding: "12px 20px",
                fontWeight: 600,
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}

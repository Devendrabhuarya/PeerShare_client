
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { SocketProvider } from "@/context/socketProvider";
import LoaderPage from "@/components/loader";
import { LoaderContext, LoaderProvider } from "@/context/loaderProvider";
import { UserDataProvider } from "@/context/userDataProvider";
import { GoogleOAuthProvider } from '@react-oauth/google';


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en">
      <body className={inter.className}>
        <GoogleOAuthProvider clientId={process.env.GOOGLE_CLIENT_ID}>
          <Toaster
            position="top-center"
            reverseOrder={false}
          />
          <UserDataProvider>
            <LoaderProvider>
              <LoaderPage />
              <SocketProvider>
                {children}
              </SocketProvider>
            </LoaderProvider>
          </UserDataProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
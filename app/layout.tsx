import type { Metadata, Viewport } from "next";
import {
  Archivo,
  Archivo_Black,
  Orbitron,
  Space_Mono,
  Permanent_Marker,
  Quicksand,
  Anton,
  Press_Start_2P,
  Fredoka,
  Luckiest_Guy,
  Cairo,
} from "next/font/google";
import "./globals.css";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap" });
const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-archivo-black",
  display: "swap",
});
const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-orbitron",
  display: "swap",
});
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});
const marker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-marker",
  display: "swap",
});
const quicksand = Quicksand({ subsets: ["latin"], variable: "--font-quicksand", display: "swap" });
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton", display: "swap" });
const pressStart = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-press-start",
  display: "swap",
});
const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", display: "swap" });
const luckiestGuy = Luckiest_Guy({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-luckiest-guy",
  display: "swap",
});
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

const fontVars = [
  archivo.variable,
  archivoBlack.variable,
  orbitron.variable,
  spaceMono.variable,
  marker.variable,
  quicksand.variable,
  anton.variable,
  pressStart.variable,
  fredoka.variable,
  luckiestGuy.variable,
  cairo.variable,
].join(" ");

export const metadata: Metadata = {
  title: "Photo Booth",
  description:
    "A whimsical Y2K-inspired four-photo film-strip photo booth that runs entirely in your browser. Your photos never leave your device.",
  applicationName: "Photo Booth",
  formatDetection: { email: false, address: false, telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#09090c",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr" data-theme="y2k-camera" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}

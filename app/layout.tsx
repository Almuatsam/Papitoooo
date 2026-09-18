import type { Metadata, Viewport } from "next";
import {
  Archivo,
  Archivo_Black,
  Orbitron,
  Space_Mono,
  Permanent_Marker,
  Quicksand,
  Press_Start_2P,
  Fredoka,
  Flavors,
  Cairo,
  Bebas_Neue,
  Montserrat,
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
const pressStart = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-press-start",
  display: "swap",
});
const fredoka = Fredoka({ subsets: ["latin"], variable: "--font-fredoka", display: "swap" });
// Y2K glittery-chrome hero/heading font — bold, hand-drawn poster script.
// Only available at weight 400, and has no bold/italic variants.
const flavors = Flavors({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-flavors",
  display: "swap",
});
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});
// Boarding Pass theme: Bebas Neue for bold headline/route text, Montserrat
// for small labels — see Fonts.txt for attribution.
const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas-neue",
  display: "swap",
});
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const fontVars = [
  archivo.variable,
  archivoBlack.variable,
  orbitron.variable,
  spaceMono.variable,
  marker.variable,
  quicksand.variable,
  pressStart.variable,
  fredoka.variable,
  flavors.variable,
  cairo.variable,
  bebasNeue.variable,
  montserrat.variable,
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

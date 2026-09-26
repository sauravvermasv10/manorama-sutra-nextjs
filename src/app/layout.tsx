import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
	variable: "--font-inter",
	subsets: ["latin"],
	display: "swap",
});

const playfair = Playfair_Display({
	variable: "--font-playfair",
	subsets: ["latin"],
	display: "swap",
});

export const metadata: Metadata = {
	title: "Manorama Sutra | Handloom Heritage. Woven Stories.",
	description:
		"A curated atelier of pure silk handloom sarees, woven by master artisans of India.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={`${inter.variable} ${playfair.variable}`}>
			<body>{children}</body>
		</html>
	);
}

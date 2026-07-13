import type { Metadata } from "next";
import { Manrope, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
	subsets: ["latin"],
	variable: "--font-manrope",
});

const ibmPlexMono = IBM_Plex_Mono({
	subsets: ["latin"],
	weight: ["400", "500"],
	variable: "--font-mono",
});

export const metadata: Metadata = {
	title: "Nodal Scribe",
	description:
		"PoC de escriba médico ambiental con captura de audio y nota SOAP estructurada.",
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="es" className={`${manrope.variable} ${ibmPlexMono.variable}`}>
			<body>{children}</body>
		</html>
	);
}

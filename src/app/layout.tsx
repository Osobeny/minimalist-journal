import type { Metadata } from "next";
import { Providers } from "./components/providers";
import Header from "./components/header";
import Footer from "./components/footer";
import "./globals.css";
import { Toaster } from "./components/ui/sonner";

export const metadata: Metadata = {
	title: "Minimalist Journal",
	description: "Simple tool for taking notes for the day",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="h-full dark">
			<body className="h-full antialiased bg-background text-foreground">
				<div className="min-h-full flex flex-col relative isolate bg-gradient-to-br from-[--background] via-gray-200 to-[--background] dark:from-[--background] dark:via-zinc-900 dark:to-[--background]">
					<div className="absolute inset-0 -z-10 opacity-50 mix-blend-soft-light bg-[url('/noise.svg')] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
					<Providers>
						<Header />
						{children}
						<Footer />
						<Toaster />
					</Providers>
				</div>
			</body>
		</html>
	);
}

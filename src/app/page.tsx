"use client";

import { useAuthStore } from "@/stores/auth";
import HomePage from "./components/home-page";

export default function Home() {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

	return (
		<main className="flex min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex-col items-center justify-center relative isolate">
			<div className="absolute inset-0 -z-10 opacity-50 mix-blend-soft-light bg-[url('/noise.svg')] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
			{isAuthenticated() ? <div>IMPLEMENT ME</div> : <HomePage />}
		</main>
	);
}

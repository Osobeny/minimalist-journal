"use client";

import { useAuthStore } from "@/stores/auth";
import HomePage from "./components/home-page";

export default function Home() {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

	if (!isAuthenticated()) {
		return (
			<main className="h-full flex flex-col items-center justify-center">
				<HomePage />
			</main>
		);
	}

	return <main>Hello World</main>;
}

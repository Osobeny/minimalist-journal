"use client";

import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import Link from "next/link";

export default function Home() {
	const session = useAuthStore((state) => state.session);
	const signedIn = session && session.expiresAt > new Date();

	return (
		<main className="flex flex-auto flex-col items-center justify-center">
			<div className="container flex flex-col items-center justify-center gap-6 px-4 py-16">
				<h1
					className={cn(
						"inline-flex tracking-tight flex-col gap-1 transition text-center",
						"font-display text-4xl sm:text-5xl md:text-6xl font-semibold leading-none lg:text-[4rem]",
						"bg-gradient-to-r from-20% bg-clip-text text-transparent",
						"from-white to-gray-50"
					)}
				>
					<span>Minimalist Journal</span>
				</h1>

				<p className="text-[#ececf399] text-lg/7 md:text-xl/8 text-pretty sm:text-wrap sm:text-center text-center">
					A simple and secure journaling app{" "}
					<span className="inline sm:block">
						with powerful search and seamless note management.
					</span>
				</p>

				{!signedIn && (
					<Link
						href="/login"
						className="px-6 py-2 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition max-w-32 w-full text-center"
					>
						Sign in
					</Link>
				)}
			</div>
		</main>
	);
}

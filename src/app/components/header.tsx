"use client";

import { useAuthStore } from "@/stores/auth";
import { Button } from "./ui/button";
import { client } from "@/lib/client";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";

const Header = () => {
	const setSession = useAuthStore((state) => state.setSession);
	const session = useAuthStore((state) => state.session);
	const signedIn = session && session.expiresAt > new Date();

	const { mutate: logout, isPending } = useMutation({
		mutationFn: async () => {
			return await client.auth.logout.$post();
		},
		onSuccess: async () => setSession(null),
	});

	return (
		<header className="p-6 max-w-4xl w-full flex justify-between items-center mx-auto">
			<Link href="/" className="relative">
				<h1 className="text-xl font-bold tracking-tight">
					Minimalist <br /> Journal
				</h1>
				<img
					src="/favicon.ico"
					alt="Favicon"
					className="absolute bottom-1.5 right-1.5 w-4 h-4"
				/>
			</Link>
			{signedIn && (
				<nav>
					<ul className="flex space-x-4">
						<li>
							<Button asChild variant="link" className="text-xl">
								<Link href="/notes">Notes</Link>
							</Button>
						</li>
						<li>
							<Button asChild variant="link" className="text-xl">
								<Link href="/search">Search</Link>
							</Button>
						</li>
					</ul>
				</nav>
			)}
			{signedIn ? (
				<Button
					variant="destructive"
					onClick={() => logout()}
					disabled={isPending}
				>
					Sign out
				</Button>
			) : (
				<Button asChild>
					<Link href="/login">Sign in</Link>
				</Button>
			)}
		</header>
	);
};

export default Header;

"use client";

import { useAuthStore } from "@/stores/auth";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function withAuth<T extends object>(
	Component: React.ComponentType
) {
	return function AuthenticatedComponent(props: T) {
		const session = useAuthStore((store) => store.session);
		const signedIn = session && session.expiresAt > new Date();

		useEffect(() => {
			if (!signedIn) {
				redirect("/login");
			}
		}, []);

		return signedIn ? <Component {...props} /> : null;
	};
}

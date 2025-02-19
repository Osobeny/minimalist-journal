import { AppRouter } from "@/server";
import { InferRouterOutputs } from "jstack";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Session = InferRouterOutputs<AppRouter>["auth"]["login"]["session"];

interface AuthStore {
	session: Session | null;
	setSession: (session: Session | null) => void;
	isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
	persist(
		(set, get) => ({
			session: null,
			setSession: (session) => set({ session }),
			isAuthenticated: () => {
				const { session } = get();
				if (!session) return false;

				return session.expiresAt > new Date();
			},
		}),
		{ name: "session" }
	)
);

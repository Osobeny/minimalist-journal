import { AppRouter } from "@/server";
import { InferRouterOutputs } from "jstack";
import { create } from "zustand";
import { persist, StorageValue } from "zustand/middleware";
import superjson from "superjson";

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
		{
			name: "session",
			storage: {
				getItem: (name) => {
					const value = localStorage.getItem(name);
					if (!value) return null;
					return superjson.parse(value) as StorageValue<AuthStore>;
				},
				setItem: (name, value) => {
					localStorage.setItem(name, superjson.stringify(value));
				},
				removeItem: (name) => localStorage.removeItem(name),
			},
		}
	)
);

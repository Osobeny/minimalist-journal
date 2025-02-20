"use client";

import { useAuthStore } from "@/stores/auth";
import {
	MutationCache,
	QueryCache,
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import { HTTPException } from "hono/http-exception";
import { PropsWithChildren, useState } from "react";
import { toast } from "sonner";

export const Providers = ({ children }: PropsWithChildren) => {
	const setSession = useAuthStore((state) => state.setSession);

	const [queryClient] = useState(
		() =>
			new QueryClient({
				queryCache: new QueryCache({
					onError: (err) => {
						if (err instanceof HTTPException) {
							toast("Error", { description: err.message });
							// global error handling, e.g. toast notification ...
						}
					},
				}),
				mutationCache: new MutationCache({
					onError: (err) => {
						if (err instanceof HTTPException) {
							if (err.status === 401) setSession(null);
							toast("Error", { description: err.message });
						}
					},
				}),
			})
	);

	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
};

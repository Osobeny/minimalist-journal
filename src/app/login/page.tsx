"use client";

import { z } from "zod";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth";
import { client } from "@/lib/client";
import { HTTPException } from "hono/http-exception";
import { LoaderCircle } from "lucide-react";
import { Separator } from "../components/ui/separator";
import { useRouter } from "next/navigation";
import Link from "next/link";

const formSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8).max(100),
});

export default function Login() {
	const setSession = useAuthStore((state) => state.setSession);
	const router = useRouter();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const { mutate: login, isPending } = useMutation({
		mutationFn: async ({ email, password }: z.infer<typeof formSchema>) => {
			const res = await client.auth.login.$post({ email, password });
			return await res.json();
		},
		onSuccess: async (data) => {
			setSession(data.session);
			router.push("/");
		},
		onError: (err) => {
			if (err instanceof HTTPException) {
				form.setError("root", { message: err.message });
			}
		},
	});

	return (
		<div className="h-full flex flex-col items-center justify-center">
			<div className="mx-auto max-w-sm space-y-6">
				<div className="space-y-2 text-center">
					<h1 className="text-3xl font-bold">Login</h1>
					<p className="text-gray-500 dark:text-gray-400">
						Enter your email below to login to your account
					</p>
				</div>
				<Form {...form}>
					<form onSubmit={form.handleSubmit((data) => login(data))}>
						<fieldset disabled={isPending} className="space-y-4">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input type="email" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<Input type="password" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit" className="w-full">
								{isPending ? (
									<LoaderCircle className="animate-spin" />
								) : (
									"Log in"
								)}
							</Button>
						</fieldset>
					</form>
				</Form>
				<Separator className="my-2" />
				<div className="text-center">
					<p className="text-muted-foreground">
						Don't have an account?{" "}
						<Link href="/register" className="underline">
							Register
						</Link>
					</p>
				</div>

				{form.formState.errors.root && (
					<p className="text-sm font-medium text-destructive text-center">
						{form.formState.errors.root.message}
					</p>
				)}
			</div>
		</div>
	);
}

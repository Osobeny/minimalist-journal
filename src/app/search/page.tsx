"use client";

import { LoaderCircle } from "lucide-react";
import withAuth from "../components/with-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { HTTPException } from "hono/http-exception";
import { PaginationWithLinks } from "../components/ui/pagination-with-links";
import { client } from "@/lib/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Note from "../components/note";

const formSchema = z.object({
	query: z.string().min(1),
});

const Search = () => {
	const searchParams = useSearchParams();
	const page = parseInt(searchParams.get("page") || "1");
	const pageSize = parseInt(searchParams.get("pageSize") || "10");

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { query: "" },
	});

	const {
		mutate: search,
		data,
		isPending,
	} = useMutation({
		mutationFn: async ({ query }: z.infer<typeof formSchema>) => {
			const res = await client.notes.search.$get({ query, page, pageSize });
			return await res.json();
		},
		onSuccess: async (data) => {
			if (data.totalNotes === 0) {
				toast("Nothing found", {
					description: "Try a different search term.",
				});
			}
		},
		onError: (err) => {
			if (err instanceof HTTPException) {
				toast("Error", { description: err.message });
			}
		},
	});

	return (
		<main className="flex flex-col flex-auto relative">
			{isPending && (
				<LoaderCircle className="animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 " />
			)}

			<div className="max-w-md w-full mx-auto p-6">
				<Form {...form}>
					<form onSubmit={form.handleSubmit((data) => search(data))}>
						<fieldset disabled={isPending} className="flex space-x-4">
							<FormField
								control={form.control}
								name="query"
								render={({ field }) => (
									<FormItem className="flex-1">
										<FormControl>
											<Input type="text" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit">Search</Button>
						</fieldset>
					</form>
				</Form>
			</div>

			<div
				className={cn(
					"flex flex-col max-w-4xl w-full mx-auto p-6",
					data?.totalNotes === 0 && "flex-auto"
				)}
			>
				{data?.totalNotes === 0 ? (
					<div className="flex justify-center items-center flex-auto">
						<p className="text-center text-balance max-w-md">
							Try entering some keywords like "project," "meeting," or "idea" to
							see if they turn up anything!
						</p>
					</div>
				) : (
					<div className="flex-1 mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
						{data?.notes.map((note) => (
							<Note
								key={note.id}
								id={note.id}
								content={note.content}
								createdAt={note.createdAt}
								edited={!!note.updatedAt}
							/>
						))}
					</div>
				)}
			</div>

			<div className={cn("mt-auto", data?.totalNotes === 0 && "hidden")}>
				<PaginationWithLinks
					page={page}
					pageSize={pageSize}
					totalCount={data?.totalNotes || 0}
				/>
			</div>
		</main>
	);
};

export default withAuth(Search);

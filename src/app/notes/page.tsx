"use client";

import { useQuery } from "@tanstack/react-query";
import withAuth from "../components/with-auth";
import { client } from "@/lib/client";
import { useSearchParams } from "next/navigation";
import { PaginationWithLinks } from "../components/ui/pagination-with-links";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import CreateEditNote from "../components/create-edit-note";
import Note from "../components/note";

const Notes = () => {
	const searchParams = useSearchParams();
	const page = parseInt(searchParams.get("page") || "1");
	const pageSize = parseInt(searchParams.get("pageSize") || "10");

	const { data, isPending: isLoadingNotes } = useQuery({
		queryKey: ["get-notes", page, pageSize],
		queryFn: async () => {
			const res = await client.notes.getAll.$get({ page, pageSize });
			return await res.json();
		},
	});

	return (
		<main className="flex flex-col flex-auto relative">
			{isLoadingNotes && (
				<LoaderCircle className="animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 " />
			)}

			<div
				className={cn(
					"flex flex-col max-w-4xl w-full mx-auto p-6",
					data?.totalNotes === 0 && "flex-auto"
				)}
			>
				{data?.totalNotes !== 0 && (
					<div className="flex justify-between">
						<div className="invisible">empty</div>
						<CreateEditNote />
					</div>
				)}

				{data?.totalNotes === 0 ? (
					<div className="flex justify-center items-center flex-auto flex-col space-y-4">
						<p>No notes yet! Start by creating your first one.</p>
						<CreateEditNote />
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

export default withAuth(Notes);

"use client";

import { useQuery } from "@tanstack/react-query";
import withAuth from "../components/with-auth";
import { client } from "@/lib/client";
import { useSearchParams } from "next/navigation";
import { PaginationWithLinks } from "../components/ui/pagination-with-links";

const Notes = () => {
	const searchParams = useSearchParams();
	const page = parseInt(searchParams.get("page") || "1");
	const pageSize = parseInt(searchParams.get("pageSize") || "20");

	const { data, isPending: isLoadingNotes } = useQuery({
		queryKey: ["get-notes"],
		queryFn: async () => {
			const res = await client.notes.getAll.$get({ page, pageSize });
			return await res.json();
		},
	});

	return (
		<div className="flex flex-col flex-auto">
			{isLoadingNotes && "Loading notes..."}
			{data && <pre>{JSON.stringify(data.notes, null, 2)}</pre>}

			<div className="mt-auto">
				<PaginationWithLinks
					page={page}
					pageSize={pageSize}
					totalCount={data?.totalPages || 1}
				/>
			</div>
		</div>
	);
};

export default withAuth(Notes);

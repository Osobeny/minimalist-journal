import { Trash } from "lucide-react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { client } from "@/lib/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CreateEditNote from "./create-edit-note";
import dayjs from "dayjs";

interface NoteProps {
	id: string;
	content: string;
	createdAt: Date;
	edited: boolean;
}

const Note = ({ id, content, createdAt, edited }: NoteProps) => {
	const queryClient = useQueryClient();

	const { mutate: deleteNote } = useMutation({
		mutationFn: async () => await client.notes.delete.$post({ id }),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["get-notes"] });
		},
	});

	return (
		<div className="p-4 border border-gray-600 rounded-lg flex flex-col">
			<ScrollArea className="max-h-28 h-full whitespace-pre-line break-all">
				{content}
			</ScrollArea>
			<div className="flex justify-between items-center">
				<span className="text-gray-400 text-sm self-end">
					{dayjs(createdAt).format("MMMM D, YYYY HH:MM")} {edited && "(edited)"}
				</span>
				<div className="flex space-x-2">
					<CreateEditNote isEditing noteId={id} content={content} />
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button size="sm" variant="destructive">
								<Trash />
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
								<AlertDialogDescription>
									This action cannot be undone. This will permanently delete
									this note and remove its data from our servers.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction onClick={() => deleteNote()}>
									Delete
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</div>
		</div>
	);
};

export default Note;

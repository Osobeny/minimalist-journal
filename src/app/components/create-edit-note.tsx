import { z } from "zod";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { HTTPException } from "hono/http-exception";
import { useState } from "react";
import { Pencil } from "lucide-react";

interface CreateEditNoteProps {
	isEditing?: boolean;
	noteId?: string;
	content?: string;
}

const formSchema = z.object({
	content: z.string().min(1).max(1000),
});

const CreateEditNote = ({
	isEditing = false,
	noteId,
	content = "",
}: CreateEditNoteProps) => {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { content },
	});

	const { mutate: createEdit, isPending } = useMutation({
		mutationFn: async ({ content }: z.infer<typeof formSchema>) => {
			if (isEditing && noteId) {
				const res = await client.notes.update.$post({ id: noteId, content });
				console.log("updating");

				return await res.json();
			}

			console.log("creating");
			const res = await client.notes.create.$post({ content });
			return await res.json();
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["get-notes"] });
			form.reset();
		},
		onError: (err) => {
			if (err instanceof HTTPException) {
				form.setError("root", { message: err.message });
			}
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					size={isEditing ? "sm" : "default"}
					variant={isEditing ? "ghost" : "outline"}
				>
					{isEditing ? <Pencil /> : "Create Note"}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{isEditing ? "Edit" : "Create"} note</DialogTitle>
					<DialogDescription>
						Enter note details below. Click save when you're done.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit((data) => {
							createEdit(data);
							setOpen(false);
						})}
					>
						<fieldset disabled={isPending} className="space-y-4">
							<FormField
								control={form.control}
								name="content"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Content</FormLabel>
										<FormControl>
											<Textarea rows={5} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<DialogFooter>
								<Button type="submit">Save changes</Button>
							</DialogFooter>
							{form.formState.errors.root && (
								<p className="text-sm font-medium text-destructive text-center">
									{form.formState.errors.root.message}
								</p>
							)}
						</fieldset>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};

export default CreateEditNote;

import * as z from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";

import axios from "axios";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

const formSchema = z.object({
	courseDept: z.string(),
	courseId: z.coerce.number(),
});

export function FindDomainSpecialists({
	res,
	setRes,
}: {
	res: Array<{sections_instructor: string; sections_dept: string; sections_id: string; sections_year: number}>;
	setRes: any;
}) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			courseDept: "cpsc",
			courseId: 110,
		},
	});

	// 2. Define a submit handler.
	function onSubmit(values: z.infer<typeof formSchema>) {
		setRes([]);
		const body = {
			WHERE: {
				AND: [
					{
						IS: {
							sections_dept: values.courseDept,
						},
					},
					{
						IS: {
							sections_id: values.courseId.toString(),
						},
					},
				],
			},
			OPTIONS: {
				COLUMNS: ["sections_instructor", "sections_dept", "sections_id", "sections_year"],
				ORDER: {
					dir: "DOWN",
					keys: ["sections_year"],
				},
			},
			TRANSFORMATIONS: {
				APPLY: [],
				GROUP: ["sections_dept", "sections_id", "sections_instructor", "sections_year"],
			},
		};

		console.log(body);
		axios.post("http://localhost:4321/query", body).then((response) => {
			setRes(response.data.result);
		});
	}
	return (
		<>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
					<FormField
						control={form.control}
						name="courseDept"
						render={({field}) => (
							<FormItem>
								<FormLabel>Course Department</FormLabel>
								<FormControl>
									<Input type="string" {...field} />
								</FormControl>
								<FormDescription>Course Department</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="courseId"
						render={({field}) => (
							<FormItem>
								<FormLabel>Course Code</FormLabel>
								<FormControl>
									<Input type="number" {...field} />
								</FormControl>
								<FormDescription>Course Code</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button type="submit">Submit</Button>
				</form>
			</Form>
			{res?.length !== 0 ? (
				<div>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="w-[100px]">Instructor</TableHead>
								<TableHead>Department</TableHead>
								<TableHead>Course Code</TableHead>
								<TableHead className="text-right">Course Year</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{res?.map((tableData, idx) => (
								<TableRow key={idx}>
									<TableCell className="font-medium">{tableData.sections_instructor}</TableCell>
									<TableCell>{tableData.sections_dept}</TableCell>
									<TableCell>{tableData.sections_id}</TableCell>
									<TableCell className="text-right">{tableData.sections_year}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			) : (
				<div></div>
			)}
		</>
	);
}

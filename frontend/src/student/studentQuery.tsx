import * as z from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem} from "@/components/ui/command";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {cn} from "@/lib/utils";
import axios from "axios";
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

const formSchema = z.object({
	average: z.coerce.number(),
	courseDigit: z.string({
		required_error: "Please select a language",
	}),
});

const courseDigit = [
	{label: "1", value: "1*"},
	{label: "2", value: "2*"},
	{label: "3", value: "3*"},
	{label: "4", value: "4*"},
	{label: "5", value: "5*"},
	{label: "6", value: "6*"},
	{label: "7", value: "7*"},
] as const;

export function FindGPABoostersForm({
	res,
	setRes,
}: {
	res: Array<{sections_dept: string; sections_id: string; overallAvg: number}>;
	setRes: any;
}) {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			average: 0,
		},
	});

	// 2. Define a submit handler.
	function onSubmit(values: z.infer<typeof formSchema>) {
		setRes([]);
		const body = {
			WHERE: {
				AND: [
					{
						GT: {
							sections_avg: values.average,
						},
					},
					{
						IS: {
							sections_id: values.courseDigit,
						},
					},
				],
			},
			OPTIONS: {
				COLUMNS: ["sections_dept", "sections_id", "overallAvg"],
				ORDER: {
					dir: "DOWN",
					keys: ["overallAvg"],
				},
			},
			TRANSFORMATIONS: {
				GROUP: ["sections_dept", "sections_id"],
				APPLY: [
					{
						overallAvg: {
							AVG: "sections_avg",
						},
					},
				],
			},
		};

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
						name="average"
						render={({field}) => (
							<FormItem>
								<FormLabel>Course Average</FormLabel>
								<FormControl>
									<Input type="number" {...field} />
								</FormControl>
								<FormDescription>Find courses with an average greater than</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="courseDigit"
						render={({field}) => (
							<FormItem className="flex flex-col">
								<FormLabel>Course Code</FormLabel>
								<Popover>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												variant="outline"
												role="combobox"
												className={cn(
													"w-[200px] justify-between",
													!field.value && "text-muted-foreground"
												)}
											>
												{field.value
													? courseDigit.find(
															(courseDigit) => courseDigit.value === field.value
													  )?.label
													: "Select Course Digit"}
											</Button>
										</FormControl>
									</PopoverTrigger>
									<PopoverContent className="w-[200px] p-0">
										<Command>
											<CommandInput placeholder="Search code..." className="h-9" />
											<CommandEmpty>This course code doesnt exist</CommandEmpty>
											<CommandGroup>
												{courseDigit.map((courseDigit) => (
													<CommandItem
														value={courseDigit.label}
														key={courseDigit.value}
														onSelect={() => {
															form.setValue("courseDigit", courseDigit.value);
														}}
													>
														{courseDigit.label}
													</CommandItem>
												))}
											</CommandGroup>
										</Command>
									</PopoverContent>
								</Popover>
								<FormDescription>Select courses beginning with the course code</FormDescription>
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
								<TableHead className="w-[100px]">Department</TableHead>
								<TableHead>Course Code</TableHead>
								<TableHead className="text-right">Historical Average</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{res?.map((tableData, idx) => (
								<TableRow key={idx}>
									<TableCell className="font-medium">{tableData.sections_dept}</TableCell>
									<TableCell>{tableData.sections_id}</TableCell>
									<TableCell className="text-right">{tableData.overallAvg}</TableCell>
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

// import * as z from "zod";
// import {zodResolver} from "@hookform/resolvers/zod";
// import {useForm} from "react-hook-form";
// import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
// import {Input} from "@/components/ui/input";
// import {Button} from "@/components/ui/button";
// import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem} from "@/components/ui/command";
// import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
// import {cn} from "@/lib/utils";
// import axios from "axios";
// import {useState} from "react";
// import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

// const formSchema = z.object({
// 	dept: z.string({
// 		required_error: "Please select a dept",
// 	}),
// 	courseId: z.coerce.number({
// 		required_error: "Please select a course id",
// 	}),
// });

// export function FindMastersOfDomain() {
// 	const [hasData, setData] = useState(false);
// 	var tableData = [{sections_dept: "", sections_id: "", overallAvg: 0}];

// 	const form = useForm<z.infer<typeof formSchema>>({
// 		resolver: zodResolver(formSchema),
// 	});

// 	// 2. Define a submit handler.
// 	function onSubmit(values: z.infer<typeof formSchema>) {
// 		setData(false);
// 		const body = {
// 			WHERE: {
// 				AND: [
// 					{
// 						GT: {
// 							sections_avg: values.dept,
// 						},
// 					},
// 					{
// 						IS: {
// 							// sections_id: values.courseDigit,
// 						},
// 					},
// 				],
// 			},
// 			OPTIONS: {
// 				COLUMNS: ["sections_dept", "sections_id", "overallAvg"],
// 				ORDER: {
// 					dir: "DOWN",
// 					keys: ["overallAvg"],
// 				},
// 			},
// 			TRANSFORMATIONS: {
// 				GROUP: ["sections_dept", "sections_id"],
// 				APPLY: [
// 					{
// 						overallAvg: {
// 							AVG: "sections_avg",
// 						},
// 					},
// 				],
// 			},
// 		};

// 		axios.post("http://localhost:4321/query", body).then((response) => {
// 			tableData = response.data.result;
// 			tableData.map((tableData) => console.log(tableData.overallAvg));
// 			setData(true);
// 		});
// 	}
// 	return (
// 		<>
// 			<Form {...form}>
// 				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
// 					<FormField
// 						control={form.control}
// 						name="dept"
// 						render={({field}) => (
// 							<FormItem>
// 								<FormLabel>Average</FormLabel>
// 								<FormControl>
// 									<Input type="number" {...field} />
// 								</FormControl>
// 								<FormDescription>This is your public display name.</FormDescription>
// 								<FormMessage />
// 							</FormItem>
// 						)}
// 					/>
// 					<FormField
// 						control={form.control}
// 						name="courseId"
// 						render={({field}) => (
// 							<FormItem className="flex flex-col">
// 								<FormLabel>Language</FormLabel>
// 								<Popover>
// 									<PopoverTrigger asChild>
// 										<FormControl>
// 											<Button
// 												variant="outline"
// 												role="combobox"
// 												className={cn(
// 													"w-[200px] justify-between",
// 													!field.value && "text-muted-foreground"
// 												)}
// 											>
// 												{/* {field.value
// 													? courseDigit.find(
// 															(courseDigit) => courseDigit.value === field.value
// 													  )?.label
// 													: "Select Course Digit"} */}
// 											</Button>
// 										</FormControl>
// 									</PopoverTrigger>
// 									<PopoverContent className="w-[200px] p-0">
// 										<Command>
// 											<CommandInput placeholder="Search framework..." className="h-9" />
// 											<CommandEmpty>No framework found.</CommandEmpty>
// 											<CommandGroup>
// 												{courseId.map((courseId) => (
// 													<CommandItem
// 														value={courseId.label}
// 														key={courseDigit.value}
// 														onSelect={() => {
// 															form.setValue("courseDigit", courseDigit.value);
// 														}}
// 													>
// 														{courseDigit.label}
// 													</CommandItem>
// 												))}
// 											</CommandGroup>
// 										</Command>
// 									</PopoverContent>
// 								</Popover>
// 								<FormDescription>
// 									This is the language that will be used in the dashboard.
// 								</FormDescription>
// 								<FormMessage />
// 							</FormItem>
// 						)}
// 					/>

// 					<Button type="submit">Submit</Button>
// 				</form>
// 			</Form>
// 			{hasData == true ? (
// 				<div>
// 					<Table>
// 						<TableCaption>A list of your recent invoices.</TableCaption>
// 						<TableHeader>
// 							<TableRow>
// 								<TableHead className="w-[100px]">Department</TableHead>
// 								<TableHead>Course Code</TableHead>
// 								<TableHead className="text-right">Historical Average</TableHead>
// 							</TableRow>
// 						</TableHeader>
// 						<TableBody>
// 							{tableData.map((tableData) => (
// 								<TableRow key={tableData.sections_id}>
// 									<TableCell className="font-medium">{tableData.sections_dept}</TableCell>
// 									<TableCell>{tableData.sections_id}</TableCell>
// 									<TableCell className="text-right">{tableData.overallAvg}</TableCell>
// 								</TableRow>
// 							))}
// 						</TableBody>
// 					</Table>
// 				</div>
// 			) : (
// 				<div></div>
// 			)}
// 		</>
// 	);
// }
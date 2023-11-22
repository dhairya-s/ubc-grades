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

export function FindGPABoostersForm() {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			average: 0,
		},
	});

	// 2. Define a submit handler.
	function onSubmit(values: z.infer<typeof formSchema>) {
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

		// const mutation = useMutation({
		// 	mutationFn: (body) => {
		// 		return axios.post("localhost:4321/query", body);
		// 	},
		// });
		axios
			.post("http://localhost:4321/query", body)
			.then((response) => console.log(response.data))
			.then((error) => console.log(error));

		// console.log(mutation);
	}
	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="average"
					render={({field}) => (
						<FormItem>
							<FormLabel>Average</FormLabel>
							<FormControl>
								<Input type="number" {...field} />
							</FormControl>
							<FormDescription>This is your public display name.</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="courseDigit"
					render={({field}) => (
						<FormItem className="flex flex-col">
							<FormLabel>Language</FormLabel>
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
												? courseDigit.find((courseDigit) => courseDigit.value === field.value)
														?.label
												: "Select Course Digit"}
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent className="w-[200px] p-0">
									<Command>
										<CommandInput placeholder="Search framework..." className="h-9" />
										<CommandEmpty>No framework found.</CommandEmpty>
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
							<FormDescription>This is the language that will be used in the dashboard.</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit">Submit</Button>
			</form>
		</Form>
	);
}

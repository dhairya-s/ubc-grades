import "./App.css";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {FindGPABoostersForm} from "./student/studentQuery";
import {useState} from "react";
import {FindDomainSpecialists} from "./instructor/instructorQuery";

function App() {
	const [stuRes, setStuRes] = useState<
		Array<{sections_dept: string; sections_id: string; overallAvg: number}> | undefined
	>([]);
	const [instRes, setInstRes] = useState<
		| Array<{sections_instructor: string; sections_dept: string; sections_id: string; sections_year: number}>
		| undefined
	>([]);
	return (
		<>
			<div>
				<Tabs defaultValue="Student Query">
					<TabsList>
						<TabsTrigger value="Student Query">Student Query</TabsTrigger>
						<TabsTrigger value="Instructor Query">Instructor Query</TabsTrigger>
					</TabsList>
					<TabsContent value="Student Query">
						<FindGPABoostersForm res={stuRes} setRes={setStuRes} />
					</TabsContent>
					<TabsContent value="Instructor Query">
						<FindDomainSpecialists res={instRes} setRes={setInstRes} />
					</TabsContent>
				</Tabs>
			</div>
		</>
	);
}

export default App;

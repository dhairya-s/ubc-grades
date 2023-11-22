import "./App.css";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {FindGPABoostersForm} from "./student/studentQuery";

function App() {
	return (
		<>
			<div>
				<Tabs defaultValue="Student Query" className="w-[400px]">
					<TabsList>
						<TabsTrigger value="Student Query">Student Query</TabsTrigger>
						<TabsTrigger value="Instructor Query">Instructor Query</TabsTrigger>
					</TabsList>
					<TabsContent value="Student Query">
						<FindGPABoostersForm />
					</TabsContent>
					<TabsContent value="Instructor Query">Change your password here.</TabsContent>
				</Tabs>
			</div>
		</>
	);
}

export default App;

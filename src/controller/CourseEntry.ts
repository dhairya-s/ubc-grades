import SectionEntry from "./SectionEntry";
import {InsightError} from "./IInsightFacade";
export default class CourseEntry {
	private sections: SectionEntry[] = [];
	private courseName: string = "";
	// Needs a path :)

	public constructor(sectionData: string, courseName: string) {
		this.courseName = courseName;
		let sectionJSON = JSON.parse(sectionData);
		for (const result of sectionJSON["result"]){
			let section = new SectionEntry(result);
			this.addSection(section);
		}
		if (this.getSections().length <= 0) {
			throw new InsightError("Course " + courseName + " is invalid.");
		}
	}

	public addSection(section: SectionEntry){
		this.sections.push(section);
		return;
	}

	public getSections(): SectionEntry[] {
		return this.sections;
	}
}

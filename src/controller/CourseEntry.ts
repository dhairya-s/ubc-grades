import SectionEntry from "./SectionEntry";
import {InsightError} from "./IInsightFacade";
export default class CourseEntry {
	private sections: SectionEntry[] = [];
	private courseName: string = "";
	// Needs a path :)

	public courseFromObject(course: any) {
		this.courseName = course["courseName"];
		for (const section in course["sections"]){
			try {
				let sectionEntry = new SectionEntry(section);
				this.addSection(sectionEntry);
			} catch {
				// Don't add the section
			}
		}
	}

	public courseFromJSON(sectionData: string, courseName: string) {
		try{
			this.courseName = courseName;
			let sectionJSON = JSON.parse(sectionData);
			for (const result of sectionJSON["result"]){
				try{
					let section = new SectionEntry(result);
					this.addSection(section);
				} catch {
					// Don't add the section.
				}
			}
		} catch {
			throw new InsightError("An invalid JSON was passed");
		}
		if (this.getSections().length <= 0) {
			throw new InsightError("Course " + courseName + " is invalid.");
		}
	}

	public saveCourse(path: string) {
		return;
	};

	public removeCourse(path: string) {
		return;
	};

	public loadSections(directory: string) {
		return;
	}

	public addSection(section: SectionEntry){
		this.sections.push(section);
		return;
	}

	public getSections(): SectionEntry[] {
		return this.sections;
	}
}

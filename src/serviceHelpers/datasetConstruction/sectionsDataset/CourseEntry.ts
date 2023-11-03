import SectionEntry from "./SectionEntry";
import JSZip from "jszip";
import {InsightError} from "../../../controller/IInsightFacade";

export default class CourseEntry {

	public children: SectionEntry[] = [];
	public courseName: string = "";

	public async parseCourse(file: JSZip.JSZipObject | null, filename: string): Promise<CourseEntry> {
		/*
		Parses a course from a JSZip representation.

		Iterate through sections in the file and attempts to create sectionEntries if
		they can be created. Else throw error and skip to the next one.
		 */
		if (file != null) {
			await file.async("text").then((body: any) => {
				try {
					this.courseFromJSON(body, filename.substring(8));
				} catch {
					throw new InsightError("Course is invalid");
				}
			});
		}
		return Promise.resolve(this);
	}

	public findValidSection(): boolean {
		/*
		Iterate through all sections to find a valid section.

		RETURNS:
		- True if a valid section can be found
		- False otherwise.
		 */
		return this.children.length > 0;
	}

	private courseFromJSON(sectionData: any, courseName: string) {
		try {
			this.setCourseName(courseName);
			let sectionJSON = JSON.parse(sectionData);
			for (const result of sectionJSON["result"]){
				try {
					let section = new SectionEntry();
					section.sectionFromJSON(result);
					this.addChild(section);
				} catch {
					// continue
				}
			}
		} catch {
			throw new InsightError("An invalid JSON was passed.");
		}
	}

	private setCourseName(courseName: string) {
		this.courseName = courseName;
	}

	private addChild(section: SectionEntry) {
		this.children.push(section);
		return;
	}

	public getChildren() {
		return this.children;
	}

	public setChildren(sections: SectionEntry[]) {
		this.children = sections;
	}

	public JSONToEntry(json: any): CourseEntry {
		this.setCourseName(json["name"]);

		let sections = json["sections"];
		let sectionEntries = [];
		for (const section of sections) {
			const sectionEntry = new SectionEntry();
			sectionEntry.sectionFromDisk(section);
			sectionEntries.push(sectionEntry);
		}

		this.setChildren(sectionEntries);

		return this;
	}
}

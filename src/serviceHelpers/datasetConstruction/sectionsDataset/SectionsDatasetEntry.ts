import {DatasetEntry} from "../DatasetEntry";
import CourseEntry from "./CourseEntry";
import {InsightDataset, InsightDatasetKind, InsightError} from "../../../controller/IInsightFacade";
import JSZip from "jszip";
import fs from "fs-extra";


export default class SectionsDatasetEntry implements DatasetEntry {

	public id: string = "";
	public numRows: number = 0;
	public kind: InsightDatasetKind = InsightDatasetKind.Sections;
	public courses: CourseEntry[] = [];

	public validateDatasetEntry(): boolean {
		/*
		Content is an entire zip file. Should use JSZip file to unzip, navigate through,
		view files inside.

		A valid dataset:
		- Is a zip file
		- Contains at least one valid section (ie. has at least one valid course)

		If this is a valid DatasetEntry:
		- Populate rest of fields
		- Save to disk

		RETURNS:
		- True if the sections dataset is valid
		- False otherwise
		 */
		for (const course of this.courses) {
			if (course.findValidSection()) {
				return true;
			}
		}
		return false;
	}

	public JSONToDatasetEntry(json: any): SectionsDatasetEntry {
		/*
		Returns a SectionsDatasetEntry from the JSON.
		 */
		this.setId(json["id"]);
		this.set_numRows(json["numRows"]);
		this.setKind(json["kind"]);

		let courses = json["courses"];
		let courseEntries: CourseEntry[] = [];
		for (const course of courses){
			const courseEntry = new CourseEntry();
			courseEntry.JSONToEntry(course);
			courseEntries.push(courseEntry);
		}

		this.setCourses(courseEntries);

		return this;
	}

	private async parseZip(content: string): Promise<CourseEntry[]> {
		/*
		Parses zip file using JSZip.

		Turns Zip file into a SectionsDatasetEntry if possible.
		- If not possible, then throws an InsightError.
		- If not valid zip file, throws InsightError

		If there exists a "courses/" directory in zip's root directory:
		- Iterate through files and create CourseEntries if they can be created.
		- Else throw error and skip to the next one.
		 */
		let zip = new JSZip();
		let courseList: CourseEntry[] = [];
		await zip.loadAsync(content, {base64: true}).then(async (unzipped_contents) => {
			try {
				let filenames = Object.keys(unzipped_contents.files);
				let filenameCourseContent: boolean[] = [];

				for (const filename of filenames) {
					filenameCourseContent.push(filename.includes("courses/"));
				}

				if (filenameCourseContent.includes(true)) {
					let courses: Array<Promise<CourseEntry>> = [];
					for (const filename of Object.keys(unzipped_contents.files)) {
						let file = zip.file(filename);
						if (file != null) {
							let course = new CourseEntry();
							let result = course.parseCourse(file, filename);
							courses.push(result);
						}
					}
					courseList = await Promise.all(courses);
				}
			} catch {
				throw new InsightError("Unable to parse dataset entry");
			}
		});
		return Promise.resolve(courseList);
	}

	public setCourses(courses: CourseEntry[]){
		this.courses = courses;
	}

	public setId(id: string) {
		this.id = id;
	}

	public setKind(kind: InsightDatasetKind) {
		this.kind = kind;
	}

	public async createDatasetEntry(id: string, content: string, kind: InsightDatasetKind): Promise<DatasetEntry> {
		/*
		Creates a SectionsDatasetEntry using the content given.
		If creating is impossible, then it throws an error.

		Steps:
		1. Decode the zip file.

		 */
		try {
			this.setId(id);
			this.setKind(kind);
			let courses = await this.parseZip(content);
			this.setCourses(courses);
		} catch {
			return Promise.reject("Could not parse zip file.");
		}
		return Promise.resolve(this);
	}

	public get_courses() {
		return this.courses;
	}

	public getId() {
		return this.id;
	}

	public async saveDataset(path: string): Promise<void> {
		let saveDir = path + "/" + this.getId() + ".json";
		let content = JSON.stringify(this);
		try {
			if (!fs.existsSync(path + "/")){
				fs.mkdirSync(path + "/");
			}
			await fs.writeJSON(saveDir, content, "utf-8");
		} catch(err) {
			return Promise.reject(new InsightError("Could not write new dataset to file."));
		}
		return Promise.resolve();
	}

	public createInsightDataset(): InsightDataset {
		return {
			id: this.getId(),
			kind: this.getKind(),
			numRows: this.getNumRows(),
		};
	}

	public set_numRows(num_rows: number){
		this.numRows = num_rows;
	}

	public getNumRows() {
		let numSections = this.get_courses().map(function(course) {
			return course.getSections().length;
		}).reduce((sum, current) => sum + current, 0);
		this.set_numRows(numSections);

		return this.numRows;
	}

	public getKind() {
		return this.kind;
	}

}

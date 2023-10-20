import CourseEntry from "./CourseEntry";
import JSZip from "jszip";
import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import fs from "fs-extra";

export default class DatasetEntry implements InsightDataset{
	public id: string = "";
	public kind: InsightDatasetKind = InsightDatasetKind.Sections;
	public courses: CourseEntry[] = [];
	public numRows: number = 0;
	public path: string = "test/resources/archives/saved_data/"; // For on disk storage

	constructor(id: string, kind: InsightDatasetKind) {
		this.id = id;
		this.kind = kind;
	}

	public async parse_dataset_entry(zip: JSZip, unzipped_content: JSZip): Promise<void> {
		let filenames = Object.keys(unzipped_content.files);

		// Create directory for saved dataset if it does not exist already
		let filenameCourseContainment: boolean[] = [];
		for (const filename of filenames) {
			filenameCourseContainment.push(filename.includes("courses/"));
		}

		if (filenameCourseContainment.includes(true)) {
			let courses: Array<Promise<CourseEntry>> = [];
			for (const filename of Object.keys(unzipped_content.files)) {
				let file = zip.file(filename);
				if (file != null) {
					let result = this.read_course(file, filename);
					courses.push(result);
				}
			}
			this.set_courses(await Promise.all(courses));
			this.set_courses(this.get_courses().filter(function(val) {
				return val !== null;
			}));
			if (this.get_courses().length <= 0) {
				throw new InsightError("Invalid dataset - no valid courses found.");
			}
		} else {
			throw new InsightError("No courses directory found.");
		}
		return;
	}

	private async read_course(file: any, filename: string): Promise<CourseEntry> {
		let course = file.async("text").then(function(this: DatasetEntry, body: any) {
			try {
				course = new CourseEntry();
				course.courseFromJSON(body, filename.substring(8));
				return course;
			} catch {
				return null;
				// throw new InsightError("Course is invalid");
			}
		});
		return course;
	}

	public async save_dataset(): Promise<void> {
		let path = this.path + this.get_id() + ".json";
		let content = JSON.stringify(this);
		try {
			await fs.writeJSON(path, content, "utf-8"); // TODO
		} catch(err) {
			return Promise.reject(new InsightError("Could not write to file."));
		}
		return Promise.resolve();
	}

	public dataset_entry_to_insight_dataset(): InsightDataset {
		return {
			id: this.get_id(),
			kind: this.get_kind(),
			numRows: this.numRows,
		};
	}

	public async load_dataset(path: string): Promise<DatasetEntry> {
		try {
			const fileContents = await fs.readJSON(path);
			let datasetJSON = JSON.parse(fileContents);
			let courses: CourseEntry[] = [];
			for (const course of datasetJSON["courses"]) {
				let parsedCourse = new CourseEntry();
				parsedCourse.courseFromObject(course);
				courses.push(parsedCourse);
			}
			this.set_courses(courses);
			this.set_id(datasetJSON["id"]);
			this.set_path(datasetJSON["path"]);
			this.set_numRows(parseInt(datasetJSON["numRows"], 10));
			// const insightDataset = this.dataset_entry_to_insight_dataset();
			return Promise.resolve(this);
		} catch (err) {
			return Promise.reject("Unable to load dataset: " + path);
		}
	}


	public get_id(): string {
		return this.id;
	}

	public get_courses(): CourseEntry[]{
		return this.courses;
	}

	public get_kind(): InsightDatasetKind {
		return this.kind;
	}

	public get_numRows(): number {
		let numSections = this.get_courses().map(function(course) {
			return course.getSections().length;
		}).reduce((sum, current) => sum + current, 0);
		this.set_numRows(numSections);

		return this.numRows;
	}

	public get_path(): string {
		return this.path;
	}

	public set_id(id: string) {
		this.id = id;
	}

	public set_courses(courses: CourseEntry[]){
		this.courses = courses;
	}

	private set_numRows(num_rows: number){
		this.numRows = num_rows;
	}

	public set_path(path: string){
		this.path = path;
	}

	public dataset_to_string(): string{
        // TODO: for list dataset function
		return "";
	}
}



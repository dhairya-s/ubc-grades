import CourseEntry from "./CourseEntry";
export default class DatasetEntry {
	private id: string = "";
	private courses: CourseEntry[] = [];
	private numRows: number = 0;
	private path: string = ""; // For on disk storage

	public get_id(): string {
		return this.id;
	}
	public get_courses(): CourseEntry[]{
		return this.courses;
	}

	public get_numRows(): number {
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

	public set_numRows(num_rows: number){
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



import {InsightError} from "./IInsightFacade";

export default class SectionEntry {
	private uuid: string = "";
	private id: string = "";
	private title: string = "";
	private instructor: string = "";
	private dept: string = "";
	private year: number = -100;
	private avg: number = -100;
	private pass: number = -100;
	private fail: number = -100;
	private audit: number = -100;

	public constructor(jsonSection: any) {
		try {
			this.set_uuid(jsonSection["id"]);
			this.set_id(jsonSection["Course"]);
			this.set_title(jsonSection["Title"]);
			this.set_instructor(jsonSection["Professor"]);
			this.set_dept(jsonSection["Subject"]);
			this.set_year(jsonSection["Year"]);
			this.set_avg(jsonSection["Avg"]);
			this.set_pass(jsonSection["Pass"]);
			this.set_fail(jsonSection["Fail"]);
			this.set_audit(jsonSection["Audit"]);
		} catch {
			throw new InsightError("Section could not be created");
		}

	}

	public set_uuid(uuid: string) {
		this.uuid = uuid;
	}

	public set_id(id: string) {
		this.id = id;
	}

	public set_title(title: string) {
		this.title = title;
	}

	public set_instructor(instructor: string) {
		this.instructor = instructor;
	}

	public set_dept(dept: string) {
		this.dept = dept;
	}

	public set_year(year: number) {
		this.year = year;
	}

	public set_avg(avg: number) {
		this.avg = avg;
	}

	public set_pass(pass: number) {
		this.pass = pass;
	}

	public set_fail(fail: number) {
		this.fail = fail;
	}

	public set_audit(audit: number) {
		this.audit = audit;
	}

	public get_uuid(): string {
		return this.uuid;
	}

	public get_id(): string {
		return this.id;
	}

	public get_title(): string {
		return this.title;
	}

	public get_instructor(): string {
		return this.instructor;
	}

	public get_dept(): string {
		return this.dept;
	}

	public get_year(): number {
		return this.year;
	}

	public get_avg(): number {
		return this.avg;
	}

	public get_pass(): number {
		return this.pass;
	}

	public get_fail(): number {
		return this.fail;
	}

	public get_audit(): number {
		return this.audit;
	}

}

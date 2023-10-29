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

	public sectionFromJSON(jsonSection: any) {
		let keys = Object.keys(jsonSection);
		let expectedKeys = ["id", "Course", "Title", "Professor", "Subject", "Year", "Avg", "Pass", "Fail", "Audit"];
		const hasAllElems = expectedKeys.every((elem) => keys.includes(elem));
		if (!hasAllElems) {
			throw new InsightError("Section could not be created");
		}
		this.set_uuid(jsonSection["id"]);
		this.set_id(jsonSection["Course"]);
		this.set_title(jsonSection["Title"]);
		this.set_instructor(jsonSection["Professor"]);
		this.set_dept(jsonSection["Subject"]);
		this.set_year(parseInt(jsonSection["Year"], 10), jsonSection);
		this.set_avg(jsonSection["Avg"]);
		this.set_pass(jsonSection["Pass"]);
		this.set_fail(jsonSection["Fail"]);
		this.set_audit(jsonSection["Audit"]);
	}

	public sectionFromDisk(sectionObject: any) {
		this.set_uuid(sectionObject["uuid"]);
		this.set_id(sectionObject["id"]);
		this.set_title(sectionObject["title"]);
		this.set_instructor(sectionObject["instructor"]);
		this.set_dept(sectionObject["dept"]);
		this.set_year(sectionObject["year"], sectionObject);
		this.set_avg(sectionObject["avg"]);
		this.set_pass(sectionObject["pass"]);
		this.set_fail(sectionObject["fail"]);
		this.set_audit(sectionObject["audit"]);
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

	public set_year(year: number, jsonSection: any) {
		if (jsonSection["Section"] && jsonSection["Section"] === "overall") {
			this.year = 1900;
		} else {
			this.year = year;
		}
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

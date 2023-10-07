export default class SectionEntry {
	private uuid: string = "";
	private id: string = "";
	private title: string = "";
	private instructor: string = "";
	private dept: string = "";
	private year: number = 2000;
	private avg: number = 50;
	private pass: number = 0;
	private fail: number = 0;
	private audit: number = 100;

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

	public get_uuid(uuid: string): string {
		return uuid;
	}

	public get_id(id: string): string {
		return id;
	}

	public get_title(title: string): string {
		return title;
	}

	public get_instructor(instructor: string): string {
		return instructor;
	}

	public get_dept(dept: string): string {
		return dept;
	}

	public get_year(year: number): number {
		return year;
	}

	public get_avg(avg: number): number {
		return avg;
	}

	public get_pass(pass: number): number {
		return pass;
	}

	public get_fail(fail: number): number {
		return fail;
	}

	public get_audit(audit: number): number {
		return audit;
	}

}

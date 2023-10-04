import SectionEntry from "./SectionEntry";
export default class CourseEntry {
	private sections: SectionEntry[] = [];

	public addSection(section: SectionEntry){
		this.sections.push(section);
		return;
	}

	public getSections(): SectionEntry[] {
		return this.sections;
	}
}

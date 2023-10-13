import DatasetEntry from "../controller/DatasetEntry";
import SectionEntry from "../controller/SectionEntry";

export default class CollectAll	{
	private datasetEntries: DatasetEntry[];

	constructor(datasetEntries: DatasetEntry[]) {
		this.datasetEntries = datasetEntries;
	}

	public collectAllQueries(): SectionEntry[] {
		let propertiesToAdd: SectionEntry[] = [];

		for (let dataset of this.datasetEntries) {
			for (let course of dataset.get_courses()) {
				for (let section of course.getSections()) {
					propertiesToAdd.push(section);
				}
			}
		}

		return propertiesToAdd;
	}

}

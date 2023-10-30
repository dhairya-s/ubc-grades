import SectionsDatasetEntry from "../../controller/SectionsDatasetEntry";
import SectionEntry from "../../controller/SectionEntry";

export default class CollectAll	{
	private datasetEntries: SectionsDatasetEntry[];

	constructor(datasetEntries: SectionsDatasetEntry[]) {
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

import SectionsDatasetEntry from "../datasetConstruction/sectionsDataset/SectionsDatasetEntry";
import SectionEntry from "../datasetConstruction/sectionsDataset/SectionEntry";

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

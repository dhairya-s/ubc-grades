import SectionsDatasetEntry from "../datasetConstruction/sectionsDataset/SectionsDatasetEntry";
import SectionEntry from "../datasetConstruction/sectionsDataset/SectionEntry";

export default class CollectAll	{
	private datasetEntries: SectionsDatasetEntry[];

	constructor(datasetEntries: SectionsDatasetEntry[]) {
		this.datasetEntries = datasetEntries;
	}

	public collectAllQueries(datasetId: string): SectionEntry[] {
		let propertiesToAdd: SectionEntry[] = [];

		for (let dataset of this.datasetEntries) {
			if (String(datasetId) === dataset.getId()) {
				for (let course of dataset.get_courses()) {
					for (let section of course.getSections()) {
						propertiesToAdd.push(section);
					}
				}
			}
		}

		return propertiesToAdd;
	}

}

import SectionsDatasetEntry from "../datasetConstruction/sectionsDataset/SectionsDatasetEntry";
import SectionEntry from "../datasetConstruction/sectionsDataset/SectionEntry";
import {DatasetEntry} from "../datasetConstruction/DatasetEntry";
import QueryObject from "../datasetConstruction/QueryObject";

export default class CollectAll	{
	private datasetEntries: DatasetEntry[];

	constructor(datasetEntries: DatasetEntry[]) {
		this.datasetEntries = datasetEntries;
	}

	public collectAllQueries(datasetId: string): QueryObject[] {
		let propertiesToAdd: QueryObject[] = [];

		for (let dataset of this.datasetEntries) {
			if (String(datasetId) === dataset.getId()) {
				for (let queryObjects of dataset.getQueryObjects()) {
					propertiesToAdd.push(queryObjects);
				}
				// for (let course of dataset.getChildren()) {
				// 	for (let section of course.getChildren()) {
				// 		propertiesToAdd.push(section);
				// 	}
				// }
			}
		}

		return propertiesToAdd;
	}

}

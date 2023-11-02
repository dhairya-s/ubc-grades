import SectionsDatasetEntry from "../../controller/SectionsDatasetEntry";
import SectionEntry from "../../controller/SectionEntry";
import CollectQuery from "../../services/collectQuery";
import CollectAll from "./collectAll";

export default class CollectNegComp {
	private datasetEntries: SectionsDatasetEntry[] = [];

	constructor(datasetEntries: SectionsDatasetEntry[]) {
		this.datasetEntries = datasetEntries;
	}

	public collectNegComp(negComp: object, datasetId: string): SectionEntry[] {
		let start = performance.now();

		let propertyToNegate: SectionEntry[] = [];
		let allProperties: SectionEntry[] = [];

		let collectQuery = new CollectQuery(negComp, this.datasetEntries);
		propertyToNegate = collectQuery.collectBody(negComp, datasetId);

		// let end1 = performance.now();
		// console.log((end1 - start) / 1000);

		let collect = new CollectAll(this.datasetEntries);
		allProperties = collect.collectAllQueries(datasetId);
		//
		// let end2 = performance.now();
		// console.log((end2 - end1) / 1000);

		let propertiesToAdd = new Set<SectionEntry>(allProperties);

		// let end3 = performance.now();
		// console.log((end3 - end2) / 1000);

		let propertyToNegateUuids: Map<string,boolean> = new Map<string, boolean>();
		for (let prop of propertyToNegate) {
			propertyToNegateUuids.set(String(prop.get_uuid()), true);
		}

		// let end4 = performance.now();
		// console.log((end4 - end3) / 1000);

		for (let sectionEntry of allProperties) {
			if (propertyToNegateUuids.has(String(sectionEntry.get_uuid()))) {
				propertiesToAdd.delete(sectionEntry);
			}
		}

		// let end5 = performance.now();
		// console.log((end5 - end4) / 1000);

		return Array.from(propertiesToAdd.values());
	}
}

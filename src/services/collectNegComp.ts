import DatasetEntry from "../controller/DatasetEntry";
import SectionEntry from "../controller/SectionEntry";
import CollectQuery from "./collectQuery";
import CollectAll from "./collectAll";

export default class CollectNegComp {
	private datasetEntries: DatasetEntry[] = [];

	constructor(datasetEntries: DatasetEntry[]) {
		this.datasetEntries = datasetEntries;
	}

	public collectNegComp(negComp: object): SectionEntry[] {
		// console.log("key logic", key);
		let propertiesToAdd = new Set<SectionEntry>();
		// let propertiesToLogic: SectionEntry[][] = [];
		let propertyToNegate: SectionEntry[] = [];
		let allProperties: SectionEntry[] = [];

		let collectQuery = new CollectQuery(negComp, this.datasetEntries);
		propertyToNegate = collectQuery.collectBody(negComp);

		let collect = new CollectAll(this.datasetEntries);
		allProperties = collect.collectAllQueries();

		for (let sectionEntry of allProperties) {
			for (let sectionToNegate of propertyToNegate) {
				if (String(sectionEntry.get_uuid()) !== String(sectionToNegate.get_uuid())) {
					propertiesToAdd.add(sectionEntry);
				}
			}
		}
		return Array.from(propertiesToAdd.values());
	}
}

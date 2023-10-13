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
		let propertyToNegate: SectionEntry[] = [];
		let allProperties: SectionEntry[] = [];

		let collectQuery = new CollectQuery(negComp, this.datasetEntries);
		propertyToNegate = collectQuery.collectBody(negComp);

		let collect = new CollectAll(this.datasetEntries);
		allProperties = collect.collectAllQueries();

		let propertiesToAdd = new Set<SectionEntry>(allProperties);

		let propertyToNegateUuids: string[] = [];
		for (let prop of propertyToNegate) {
			propertyToNegateUuids.push(String(prop.get_uuid()));
		}

		for (let sectionEntry of allProperties) {
			if (propertyToNegateUuids.includes(String(sectionEntry.get_uuid()))) {
				propertiesToAdd.delete(sectionEntry);
			}
		}

		return Array.from(propertiesToAdd.values());
	}
}

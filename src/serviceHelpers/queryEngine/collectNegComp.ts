
import CollectQuery from "../../services/collectQuery";
import CollectAll from "./collectAll";
import {DatasetEntry} from "../datasetConstruction/DatasetEntry";
import QueryObject from "../datasetConstruction/QueryObject";
import {InsightDatasetKind} from "../../controller/IInsightFacade";

export default class CollectNegComp {
	private datasetEntries: DatasetEntry[] = [];

	constructor(datasetEntries: DatasetEntry[]) {
		this.datasetEntries = datasetEntries;
	}

	public collectNegComp(negComp: object, datasetId: string, datasetKind: InsightDatasetKind): QueryObject[] {
		// let start = performance.now();

		let propertyToNegate: QueryObject[] = [];
		let allProperties: QueryObject[] = [];

		let collectQuery = new CollectQuery(negComp, this.datasetEntries);
		propertyToNegate = collectQuery.collectBody(negComp, datasetId, datasetKind);

		// let end1 = performance.now();
		// console.log((end1 - start) / 1000);

		let collect = new CollectAll(this.datasetEntries);
		allProperties = collect.collectAllQueries(datasetId);
		//
		// let end2 = performance.now();
		// console.log((end2 - end1) / 1000);

		let propertiesToAdd = new Set<QueryObject>(allProperties);

		// let end3 = performance.now();
		// console.log((end3 - end2) / 1000);

		let propertyToNegateIds: Map<string,boolean> = new Map<string, boolean>();
		for (let prop of propertyToNegate) {
			if (datasetKind === InsightDatasetKind.Sections) {
				propertyToNegateIds.set(String(prop.get_uuid()), true);
			} else if (datasetKind === InsightDatasetKind.Rooms) {
				propertyToNegateIds.set(String(prop.getName()), true);
			}
		}

		// let end4 = performance.now();
		// console.log((end4 - end3) / 1000);

		for (let queryObject of allProperties) {
			if (datasetKind === InsightDatasetKind.Sections) {
				if (propertyToNegateIds.has(String(queryObject.get_uuid()))) {
					propertiesToAdd.delete(queryObject);
				}
			} else if (datasetKind === InsightDatasetKind.Rooms) {
				if (propertyToNegateIds.has(String(queryObject.getName()))) {
					propertiesToAdd.delete(queryObject);
				}
			}

		}

		// let end5 = performance.now();
		// console.log((end5 - end4) / 1000);

		return Array.from(propertiesToAdd.values());
	}
}

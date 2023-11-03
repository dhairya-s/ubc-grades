import SectionsDatasetEntry from "../datasetConstruction/sectionsDataset/SectionsDatasetEntry";
import SectionEntry from "../datasetConstruction/sectionsDataset/SectionEntry";
import {InsightError} from "../../controller/IInsightFacade";
import QueryObject from "../datasetConstruction/QueryObject";
import {DatasetEntry} from "../datasetConstruction/DatasetEntry";

export default class CollectScomp {
	private datasetEntries: DatasetEntry[] = [];

	constructor(datasetEntries: DatasetEntry[]) {
		this.datasetEntries = datasetEntries;
	}

	public collectSCOMP(scomp: object, datasetId: string): QueryObject[] {
		let propertiesToAdd: QueryObject[] = [];

		let localKey: string[] = Object.keys(scomp);
		// const datasetId = localKey[0].split("_")[0];
		let isValidId = false;
		const localKeyField = localKey[0].split("_")[1];
		const value: string = scomp[localKey[0] as keyof typeof scomp];

		for (let dataset of this.datasetEntries) {
			if (String(datasetId) === String(dataset.getId())) {
				isValidId = true;
				for (let queryObject of dataset.getQueryObjects()) {
					let qEntry = this.handleSFields(queryObject, localKeyField, value);
					if (qEntry !== null) {
						propertiesToAdd.push(qEntry);
					}
				}
				// for (let course of dataset.getChildren()) {
				// 	for (let section of course.getChildren()) {
				// 		let sectionEntry: QueryObject | null = this.handleSFields(section, localKeyField, value);
				// 		// if (Object.keys(obj).length !== 0) {
				// 		// 	propertiesToAdd.push(obj);
				// 		// }
				// 		if (sectionEntry !== null) {
				// 			propertiesToAdd.push(sectionEntry);
				// 		}
				// 	}
				// }
			}
		}

		if (!isValidId) {
			throw new InsightError("Invalid dataset id");
		}
		return propertiesToAdd;
	}

	// private helpers

	private handleSFields(qObj: QueryObject, localKeyField: string, value: string): QueryObject | null {
		let result: QueryObject | null = null;

		if (localKeyField === "dept") {
			result = this.handleWildCards(qObj, value, qObj.get_dept());
		} else if (localKeyField === "id") {
			result = this.handleWildCards(qObj, value, qObj.get_id());
		} else if (localKeyField === "instructor") {
			result = this.handleWildCards(qObj, value, qObj.get_instructor());
		} else if (localKeyField === "title") {
			result = this.handleWildCards(qObj, value, qObj.get_title());
		} else if (localKeyField === "uuid") {
			result = this.handleWildCards(qObj, value, qObj.get_uuid());
		} else if (localKeyField === "fullname") {
			result = this.handleWildCards(qObj, value, qObj.getFullname());
		} else if (localKeyField === "shortname") {
			result = this.handleWildCards(qObj, value, qObj.getShortname());
		} else if (localKeyField === "number") {
			result = this.handleWildCards(qObj, value, qObj.getNumber());
		} else if (localKeyField === "name") {
			result = this.handleWildCards(qObj, value, qObj.getName());
		} else if (localKeyField === "address") {
			result = this.handleWildCards(qObj, value, qObj.getAddress());
		} else if (localKeyField === "type") {
			result = this.handleWildCards(qObj, value, qObj.getType());
		} else if (localKeyField === "furniture") {
			result = this.handleWildCards(qObj, value, qObj.getFurniture());
		} else if (localKeyField === "href") {
			result = this.handleWildCards(qObj, value, qObj.getHref());
		}

		return result;
	}

	private handleWildCards(qObj: QueryObject, value: string, qObjValue: string): QueryObject | null {
		let result: QueryObject | null = null;

		if (!value.includes("*")) {
			result = this.matchesExactly(qObj, value, qObjValue);
		} else if (value.startsWith("*") && value.endsWith("*")) {
			result = this.contains(qObj, value, qObjValue);
		} else if (value.startsWith("*")) {
			result = this.endsWith(qObj, value, qObjValue);
		} else if (value.endsWith("*")) {
			result = this.startsWith(qObj, value, qObjValue);
		}

		return result;
	}

	private matchesExactly(qObj: QueryObject, value: string, qObjValue: string): QueryObject | null {
		// let propertiesToAdd: Property[] = [];

		if (String(qObjValue) === value) {
			return qObj;
		}
		return null;
	}

	private endsWith(qObj: QueryObject, value: string, qObjValue: string): QueryObject | null {
		// let propertiesToAdd: Property[] = [];
		let split = value.split("*")[1];
		if (String(qObjValue).endsWith(split)) {
			return qObj;
			// propertiesToAdd = collectInsightResult(section, this.resultCols);
		}
		// return convertArrayOfObjectToObject(propertiesToAdd);
		return null;
	}

	private startsWith(qObj: QueryObject, value: string, qObjValue: string): QueryObject | null {
		// let propertiesToAdd: Property[] = [];
		let split = value.split("*")[0];
		if (String(qObjValue).startsWith(split)) {
			// propertiesToAdd = collectInsightResult(section, this.resultCols);
			return qObj;
		}
		// return convertArrayOfObjectToObject(propertiesToAdd);
		return null;
	}

	private contains(qObj: QueryObject, value: string, qObjValue: string): QueryObject | null {
		// let propertiesToAdd: Property[] = [];
		let split = value.split("*")[1];

		if (String(qObjValue).includes(split)) {
			return qObj;
			// propertiesToAdd = collectInsightResult(section, this.resultCols);
		}
		// return convertArrayOfObjectToObject(propertiesToAdd);
		return null;
	}

}

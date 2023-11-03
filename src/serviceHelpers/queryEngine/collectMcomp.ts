import SectionsDatasetEntry from "../datasetConstruction/sectionsDataset/SectionsDatasetEntry";
import SectionEntry from "../datasetConstruction/sectionsDataset/SectionEntry";
import {Property} from "../../services/collectQuery";
import {collectInsightResult, convertArrayOfObjectToObject} from "../helpers/collectionHelpers";
import {InsightError} from "../../controller/IInsightFacade";
import QueryObject from "../datasetConstruction/QueryObject";
import {DatasetEntry} from "../datasetConstruction/DatasetEntry";

export default class CollectMcomp {
	private datasetEntries: DatasetEntry[] = [];

	constructor(datasetEntries: DatasetEntry[]) {
		this.datasetEntries = datasetEntries;
	}

	public collectMCOMP(mcomp: object, key: string, datasetId: string): SectionEntry[] {
		let propertiesToAdd: SectionEntry[] = [];

		let localKey: string[] = Object.keys(mcomp); // sections_id
		// const datasetId = localKey[0].split("_")[0];
		let isValidId = false;
		const localKeyField = localKey[0].split("_")[1]; // id
		const value: number = mcomp[localKey[0] as keyof typeof mcomp];

		for (let dataset of this.datasetEntries) {
			if (String(datasetId) === String(dataset.getId())) {
				isValidId = true;
				for (let queryObject of dataset.getQueryObjects()) {
					let qEntry = this.handleMFields(queryObject, localKeyField, key, value);
					if (qEntry !==  null) {
						propertiesToAdd.push(qEntry);
					}
				}

				// for (let course of dataset.getChildren()) {
				// 	for (let section of course.getChildren()) {
				// 		let qobj: QueryObject | null = this.handleMFields(section, localKeyField, key, value);
				// 		// if (Object.keys(obj).length !== 0) {
				// 		// 	propertiesToAdd.push(obj);
				// 		// }
				// 		if (qobj !==  null) {
				// 			propertiesToAdd.push(qobj);
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

	private applyGT(section: SectionEntry, value: number, sectionVal: number): SectionEntry | null {
		// let propertiesToAdd: Property[] = [];
		if (sectionVal > value) {
			// console.log("applyGT result cols", this.resultCols);
			// propertiesToAdd = collectInsightResult(section, this.resultCols);
			return section;
		}
		return null;

		// return convertArrayOfObjectToObject(propertiesToAdd);
	}

	private applyEQ(section: SectionEntry, value: number, sectionVal: number): SectionEntry | null {
		// let propertiesToAdd: Property[] = [];
		if (sectionVal === value) {
			return  section;
			// propertiesToAdd = collectInsightResult(section, this.resultCols);
		}
		return null;
		// return convertArrayOfObjectToObject(propertiesToAdd);
	}

	private applyLT(section: SectionEntry, value: number, sectionVal: number): SectionEntry | null {
		// let propertiesToAdd: Property[] = [];
		if (sectionVal < value) {
			return section;
			// propertiesToAdd = collectInsightResult(section, this.resultCols);
		}
		return null;
		// return convertArrayOfObjectToObject(propertiesToAdd);
	}

	private handleMFields(qobj: QueryObject, lKeyField: string, key: string, value: number): QueryObject | null {
		let result: QueryObject | null = null;

		if (lKeyField === "avg") {
			if (key === "GT") {
				result = this.applyGT(qobj, value, qobj.get_avg());
			} else if (key === "EQ") {
				result = this.applyEQ(qobj, value, qobj.get_avg());
			} else if (key === "LT") {
				result = this.applyLT(qobj, value, qobj.get_avg());
			}
		} else if (lKeyField === "pass") {
			if (key === "GT") {
				result = this.applyGT(qobj, value, qobj.get_pass());
			} else if (key === "EQ") {
				result = this.applyEQ(qobj, value, qobj.get_pass());
			} else if (key === "LT") {
				result = this.applyLT(qobj, value, qobj.get_pass());
			}
		} else if (lKeyField === "fail") {
			if (key === "GT") {
				result = this.applyGT(qobj, value, qobj.get_fail());
			} else if (key === "EQ") {
				result = this.applyEQ(qobj, value, qobj.get_fail());
			} else if (key === "LT") {
				result = this.applyLT(qobj, value, qobj.get_fail());
			}
		} else if (lKeyField === "audit") {
			if (key === "GT") {
				result = this.applyGT(qobj, value, qobj.get_audit());
			} else if (key === "EQ") {
				result = this.applyEQ(qobj, value, qobj.get_audit());
			} else if (key === "LT") {
				result = this.applyLT(qobj, value, qobj.get_audit());
			}
		} else if (lKeyField === "year") {
			if (key === "GT") {
				result = this.applyGT(qobj, value, qobj.get_year());
			} else if (key === "EQ") {
				result = this.applyEQ(qobj, value, qobj.get_year());
			} else if (key === "LT") {
				result = this.applyLT(qobj, value, qobj.get_year());
			}
		}

		return result;
	}
}

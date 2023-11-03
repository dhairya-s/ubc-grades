import {InsightError} from "../../controller/IInsightFacade";
import QueryObject from "../datasetConstruction/QueryObject";
import {DatasetEntry} from "../datasetConstruction/DatasetEntry";

export default class CollectMcomp {
	private datasetEntries: DatasetEntry[] = [];

	constructor(datasetEntries: DatasetEntry[]) {
		this.datasetEntries = datasetEntries;
	}

	public collectMCOMP(mcomp: object, key: string, datasetId: string): QueryObject[] {
		let propertiesToAdd:  QueryObject[] = [];

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

	private applyGT(section: QueryObject, value: number, sectionVal: number): QueryObject | null {
		// let propertiesToAdd: Property[] = [];
		if (sectionVal > value) {
			// console.log("applyGT result cols", this.resultCols);
			// propertiesToAdd = collectInsightResult(section, this.resultCols);
			return section;
		}
		return null;

		// return convertArrayOfObjectToObject(propertiesToAdd);
	}

	private applyEQ(section: QueryObject, value: number, sectionVal: number): QueryObject | null {
		// let propertiesToAdd: Property[] = [];
		if (sectionVal === value) {
			return  section;
			// propertiesToAdd = collectInsightResult(section, this.resultCols);
		}
		return null;
		// return convertArrayOfObjectToObject(propertiesToAdd);
	}

	private applyLT(section: QueryObject, value: number, sectionVal: number): QueryObject | null {
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
			result = this.mFieldsHelper(qobj, key, value, qobj.get_avg());
		} else if (lKeyField === "pass") {
			result = this.mFieldsHelper(qobj, key, value, qobj.get_pass());

		} else if (lKeyField === "fail") {
			result = this.mFieldsHelper(qobj, key, value, qobj.get_fail());

		} else if (lKeyField === "audit") {
			result = this.mFieldsHelper(qobj, key, value, qobj.get_audit());

		} else if (lKeyField === "year") {
			result = this.mFieldsHelper(qobj, key, value, qobj.get_year());

		} else if (lKeyField === "lat") {
			result = this.mFieldsHelper(qobj, key, value, qobj.getLat());

		}  else if (lKeyField === "lon") {
			result = this.mFieldsHelper(qobj, key, value, qobj.getLon());

		}  else if (lKeyField === "seats") {
			result = this.mFieldsHelper(qobj, key, value, qobj.getSeats());
		}
		return result;
	}

	private mFieldsHelper(qobj: QueryObject, key: string, value: number, qObjVal: number) {
		let result: QueryObject | null = null;

		if (key === "GT") {
			result = this.applyGT(qobj, value, qObjVal);
		} else if (key === "EQ") {
			result = this.applyEQ(qobj, value, qObjVal);
		} else if (key === "LT") {
			result = this.applyLT(qobj, value, qObjVal);
		}

		return result;
	}
}

import SectionsDatasetEntry from "../controller/SectionsDatasetEntry";
import SectionEntry from "../controller/SectionEntry";
import {Property} from "./collectQuery";
import {collectInsightResult, convertArrayOfObjectToObject} from "./collectionHelpers";
import {InsightError} from "../controller/IInsightFacade";

export default class CollectMcomp {
	private datasetEntries: SectionsDatasetEntry[] = [];

	constructor(datasetEntries: SectionsDatasetEntry[]) {
		this.datasetEntries = datasetEntries;
	}

	public collectMCOMP(mcomp: object, key: string): SectionEntry[] {
		let propertiesToAdd: SectionEntry[] = [];

		let localKey: string[] = Object.keys(mcomp); // sections_id
		const datasetId = localKey[0].split("_")[0];
		let isValidId = false;
		const localKeyField = localKey[0].split("_")[1]; // id
		const value: number = mcomp[localKey[0] as keyof typeof mcomp];

		for (let dataset of this.datasetEntries) {
			if (String(datasetId) === String(dataset.get_id())) {
				isValidId = true;
				for (let course of dataset.get_courses()) {
					for (let section of course.getSections()) {
						let sectionEntry: SectionEntry | null = this.handleMFields(section, localKeyField, key, value);
						// if (Object.keys(obj).length !== 0) {
						// 	propertiesToAdd.push(obj);
						// }
						if (sectionEntry !==  null) {
							propertiesToAdd.push(sectionEntry);
						}
					}
				}
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

	private handleMFields(section: SectionEntry, lKeyField: string, key: string, value: number): SectionEntry | null {
		let result: SectionEntry | null = null;

		if (lKeyField === "avg") {
			if (key === "GT") {
				result = this.applyGT(section, value, section.get_avg());
			} else if (key === "EQ") {
				result = this.applyEQ(section, value, section.get_avg());
			} else if (key === "LT") {
				result = this.applyLT(section, value, section.get_avg());
			}
		} else if (lKeyField === "pass") {
			if (key === "GT") {
				result = this.applyGT(section, value, section.get_pass());
			} else if (key === "EQ") {
				result = this.applyEQ(section, value, section.get_pass());
			} else if (key === "LT") {
				result = this.applyLT(section, value, section.get_pass());
			}
		} else if (lKeyField === "fail") {
			if (key === "GT") {
				result = this.applyGT(section, value, section.get_fail());
			} else if (key === "EQ") {
				result = this.applyEQ(section, value, section.get_fail());
			} else if (key === "LT") {
				result = this.applyLT(section, value, section.get_fail());
			}
		} else if (lKeyField === "audit") {
			if (key === "GT") {
				result = this.applyGT(section, value, section.get_audit());
			} else if (key === "EQ") {
				result = this.applyEQ(section, value, section.get_audit());
			} else if (key === "LT") {
				result = this.applyLT(section, value, section.get_audit());
			}
		} else if (lKeyField === "year") {
			if (key === "GT") {
				result = this.applyGT(section, value, section.get_year());
			} else if (key === "EQ") {
				result = this.applyEQ(section, value, section.get_year());
			} else if (key === "LT") {
				result = this.applyLT(section, value, section.get_year());
			}
		}

		return result;
	}
}

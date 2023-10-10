import DatasetEntry from "../controller/DatasetEntry";
import SectionEntry from "../controller/SectionEntry";
import {Property} from "./collectQuery";
import {collectInsightResult, convertArrayOfObjectToObject} from "./collectionHelpers";

export default class CollectMcomp {
	private datasetEntries: DatasetEntry[] = [];
	private resultCols: Set<string>;

	constructor(datasetEntries: DatasetEntry[], resultCols: Set<string>) {
		this.datasetEntries = datasetEntries;
		this.resultCols = resultCols;
	}

	public collectMCOMP(mcomp: object, key: string): object[] {
		let propertiesToAdd: object[] = [];

		let localKey: string[] = Object.keys(mcomp);
		const localKeyField = localKey[0].split("_")[1];
		const value: number = mcomp[localKey[0] as keyof typeof mcomp];

		for (let dataset of this.datasetEntries) {
			for (let course of dataset.get_courses()) {
				for (let section of course.getSections()) {
					let obj = this.handleMFields(section, localKeyField, key, value);
					if (Object.keys(obj).length !== 0) {
						propertiesToAdd.push(obj);
					}
				}
			}
		}
		return propertiesToAdd;
	}

	// private helpers

	private applyGT(section: SectionEntry, value: number, sectionVal: number): object {
		let propertiesToAdd: Property[] = [];
		if (sectionVal > value) {
			propertiesToAdd = collectInsightResult(section, this.resultCols);
		}
		return convertArrayOfObjectToObject(propertiesToAdd);
	}

	private applyEQ(section: SectionEntry, value: number, sectionVal: number): object {
		let propertiesToAdd: Property[] = [];
		if (sectionVal === value) {
			propertiesToAdd = collectInsightResult(section, this.resultCols);
		}
		return convertArrayOfObjectToObject(propertiesToAdd);
	}

	private applyLT(section: SectionEntry, value: number, sectionVal: number): object {
		let propertiesToAdd: Property[] = [];
		if (sectionVal < value) {
			propertiesToAdd = collectInsightResult(section, this.resultCols);
		}
		return convertArrayOfObjectToObject(propertiesToAdd);
	}

	private handleMFields(section: SectionEntry, localKeyField: string, key: string, value: number): object {
		let result: object = {};

		if (localKeyField === "avg") {
			if (key === "GT") {
				result = this.applyGT(section, value, section.get_avg());
			} else if (key === "EQ") {
				result = this.applyEQ(section, value, section.get_avg());
			} else if (key === "LT") {
				result = this.applyLT(section, value, section.get_avg());
			}
		} else if (localKeyField === "pass") {
			if (key === "GT") {
				result = this.applyGT(section, value, section.get_pass());
			} else if (key === "EQ") {
				result = this.applyEQ(section, value, section.get_pass());
			} else if (key === "LT") {
				result = this.applyLT(section, value, section.get_pass());
			}
		} else if (localKeyField === "fail") {
			if (key === "GT") {
				result = this.applyGT(section, value, section.get_fail());
			} else if (key === "EQ") {
				result = this.applyEQ(section, value, section.get_fail());
			} else if (key === "LT") {
				result = this.applyLT(section, value, section.get_fail());
			}
		} else if (localKeyField === "audit") {
			if (key === "GT") {
				result = this.applyGT(section, value, section.get_audit());
			} else if (key === "EQ") {
				result = this.applyEQ(section, value, section.get_audit());
			} else if (key === "LT") {
				result = this.applyLT(section, value, section.get_audit());
			}
		} else if (localKeyField === "year") {
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

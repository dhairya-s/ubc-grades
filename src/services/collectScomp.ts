import DatasetEntry from "../controller/DatasetEntry";
import SectionEntry from "../controller/SectionEntry";
import {collectInsightResult, convertArrayOfObjectToObject} from "./collectionHelpers";
import {Property} from "./collectQuery";

export default class CollectScomp {
	private datasetEntries: DatasetEntry[] = [];
	private resultCols: Set<string>;

	constructor(datasetEntries: DatasetEntry[], resultCols: Set<string>) {
		this.datasetEntries = datasetEntries;
		this.resultCols = resultCols;
		// console.log("S result cols", this.resultCols);
	}

	public collectSCOMP(scomp: object): SectionEntry[] {
		let propertiesToAdd: SectionEntry[] = [];

		let localKey: string[] = Object.keys(scomp);
		const localKeyField = localKey[0].split("_")[1];
		const value: string = scomp[localKey[0] as keyof typeof scomp];

		for (let dataset of this.datasetEntries) {
			for (let course of dataset.get_courses()) {
				for (let section of course.getSections()) {
					let sectionEntry: SectionEntry | null = this.handleSFields(section, localKeyField, value);
					// if (Object.keys(obj).length !== 0) {
					// 	propertiesToAdd.push(obj);
					// }
					if (sectionEntry !== null) {
						propertiesToAdd.push(sectionEntry);
					}
				}
			}
		}
		return propertiesToAdd;
	}

	// private helpers

	private handleSFields(section: SectionEntry, localKeyField: string, value: string): SectionEntry | null {
		let result: SectionEntry | null = null;

		if (localKeyField === "dept") {
			result = this.handleWildCards(section, value, section.get_dept());
		} else if (localKeyField === "id") {
			result = this.handleWildCards(section, value, section.get_id());
		} else if (localKeyField === "instructor") {
			result = this.handleWildCards(section, value, section.get_instructor());
		} else if (localKeyField === "title") {
			result = this.handleWildCards(section, value, section.get_title());
		} else if (localKeyField === "uuid") {
			result = this.handleWildCards(section, value, section.get_uuid());
		}

		return result;
	}

	private handleWildCards(section: SectionEntry, value: string, sectionValue: string): SectionEntry | null {
		let result: SectionEntry | null = null;

		if (!value.includes("*")) {
			result = this.matchesExactly(section, value, sectionValue);
		} else if (value.startsWith("*") && value.endsWith("*")) {
			result = this.contains(section, value, sectionValue);
		} else if (value.startsWith("*")) {
			result = this.endsWith(section, value, sectionValue);
		} else if (value.endsWith("*")) {
			result = this.startsWith(section, value, sectionValue);
		}

		return result;
	}

	private matchesExactly(section: SectionEntry, value: string, sectionVal: string): SectionEntry | null {
		// let propertiesToAdd: Property[] = [];

		if (String(sectionVal) === value) {
			return section;
		}
		return null;
	}

	private endsWith(section: SectionEntry, value: string, sectionVal: string): SectionEntry | null {
		// let propertiesToAdd: Property[] = [];
		let split = value.split("*")[1];
		if (sectionVal.endsWith(split)) {
			return section;
			// propertiesToAdd = collectInsightResult(section, this.resultCols);
		}
		// return convertArrayOfObjectToObject(propertiesToAdd);
		return null;
	}

	private startsWith(section: SectionEntry, value: string, sectionVal: string): SectionEntry | null {
		// let propertiesToAdd: Property[] = [];
		let split = value.split("*")[0];
		if (sectionVal.startsWith(split)) {
			// propertiesToAdd = collectInsightResult(section, this.resultCols);
			return section;
		}
		// return convertArrayOfObjectToObject(propertiesToAdd);
		return null;
	}

	private contains(section: SectionEntry, value: string, sectionVal: string): SectionEntry | null {
		// let propertiesToAdd: Property[] = [];
		let split = value.split("*")[1];

		if (sectionVal.includes(split)) {
			return section;
			// propertiesToAdd = collectInsightResult(section, this.resultCols);
		}
		// return convertArrayOfObjectToObject(propertiesToAdd);
		return null;
	}

}

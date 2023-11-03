import SectionsDatasetEntry from "../datasetConstruction/sectionsDataset/SectionsDatasetEntry";
import SectionEntry from "../datasetConstruction/sectionsDataset/SectionEntry";
import {InsightError} from "../../controller/IInsightFacade";

export default class CollectScomp {
	private datasetEntries: SectionsDatasetEntry[] = [];

	constructor(datasetEntries: SectionsDatasetEntry[]) {
		this.datasetEntries = datasetEntries;
	}

	public collectSCOMP(scomp: object, datasetId: string): SectionEntry[] {
		let propertiesToAdd: SectionEntry[] = [];

		let localKey: string[] = Object.keys(scomp);
		// const datasetId = localKey[0].split("_")[0];
		let isValidId = false;
		const localKeyField = localKey[0].split("_")[1];
		const value: string = scomp[localKey[0] as keyof typeof scomp];

		for (let dataset of this.datasetEntries) {
			if (String(datasetId) === String(dataset.getId())) {
				isValidId = true;
				for (let course of dataset.getChildren()) {
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
		}

		if (!isValidId) {
			throw new InsightError("Invalid dataset id");
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
		if (String(sectionVal).endsWith(split)) {
			return section;
			// propertiesToAdd = collectInsightResult(section, this.resultCols);
		}
		// return convertArrayOfObjectToObject(propertiesToAdd);
		return null;
	}

	private startsWith(section: SectionEntry, value: string, sectionVal: string): SectionEntry | null {
		// let propertiesToAdd: Property[] = [];
		let split = value.split("*")[0];
		if (String(sectionVal).startsWith(split)) {
			// propertiesToAdd = collectInsightResult(section, this.resultCols);
			return section;
		}
		// return convertArrayOfObjectToObject(propertiesToAdd);
		return null;
	}

	private contains(section: SectionEntry, value: string, sectionVal: string): SectionEntry | null {
		// let propertiesToAdd: Property[] = [];
		let split = value.split("*")[1];

		if (String(sectionVal).includes(split)) {
			return section;
			// propertiesToAdd = collectInsightResult(section, this.resultCols);
		}
		// return convertArrayOfObjectToObject(propertiesToAdd);
		return null;
	}

}

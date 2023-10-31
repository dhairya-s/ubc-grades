import SectionEntry from "../datasetConstruction/sectionsDataset/SectionEntry";
import {Property} from "../../services/collectQuery";

export function collectInsightResult(section: SectionEntry, resultCols: Set<string>): object {
	let propertiesToAdd: Property[] = [];
	for (let resultCol of resultCols) {
		let keyField = resultCol.split("_")[1];
		if (keyField === "avg") {
			propertiesToAdd.push({key:resultCol, value: Number(section.get_avg())});
		} else if (keyField === "pass") {
			propertiesToAdd.push({key:resultCol, value: Number(section.get_pass())});
		} else if (keyField === "fail") {
			propertiesToAdd.push({key:resultCol, value: Number(section.get_fail())});
		} else if (keyField === "audit") {
			propertiesToAdd.push({key:resultCol, value: Number(section.get_audit())});
		} else if (keyField === "year") {
			propertiesToAdd.push({key:resultCol, value: Number(section.get_year())});
		} else if (keyField === "dept") {
			propertiesToAdd.push({key:resultCol, value: String(section.get_dept())});
		} else if (keyField === "id") {
			propertiesToAdd.push({key:resultCol, value: String(section.get_id())});
		} else if (keyField === "instructor") {
			propertiesToAdd.push({key:resultCol, value: String(section.get_instructor())});
		} else if (keyField === "title") {
			propertiesToAdd.push({key:resultCol, value: String(section.get_title())});
		} else if (keyField === "uuid") {
			propertiesToAdd.push({key:resultCol, value: String(section.get_uuid())});
		}
	}

	return convertArrayOfObjectToObject(propertiesToAdd);
}

export function compare(val: string|number, val2: string|number) {
	if (val < val2) {
		return -1;
	} else if (val > val2) {
		return 1;
	} else {
		return 0;
	}
}


export function convertArrayOfObjectToObject(properties: Property[]): object {
	let result: Record<string, string | number> = {};
	for (let property of properties) {
		result[property.key] = property.value;
	}
	return result;
}

import SectionEntry from "../datasetConstruction/sectionsDataset/SectionEntry";
import {Property} from "../../services/collectQuery";
import {InsightDatasetKind, InsightError} from "../../controller/IInsightFacade";
import QueryObject from "../datasetConstruction/QueryObject";

export function collectInsightResult(qObj: QueryObject, resultCols: Set<string>): Property[] {
	let propertiesToAdd: Property[] = [];
	for (let resultCol of resultCols) {
		let keyField = resultCol.split("_")[1];
		if (keyField === "avg") {
			propertiesToAdd.push({key:resultCol, value: Number(qObj.get_avg())});
		} else if (keyField === "pass") {
			propertiesToAdd.push({key:resultCol, value: Number(qObj.get_pass())});
		} else if (keyField === "fail") {
			propertiesToAdd.push({key:resultCol, value: Number(qObj.get_fail())});
		} else if (keyField === "audit") {
			propertiesToAdd.push({key:resultCol, value: Number(qObj.get_audit())});
		} else if (keyField === "year") {
			propertiesToAdd.push({key:resultCol, value: Number(qObj.get_year())});
		} else if (keyField === "lat") {
			propertiesToAdd.push({key:resultCol, value: Number(qObj.getLat())});
		} else if (keyField === "lon") {
			propertiesToAdd.push({key:resultCol, value: Number(qObj.getLon())});
		} else if (keyField === "seats") {
			propertiesToAdd.push({key:resultCol, value: Number(qObj.getSeats())});
		} else if (keyField === "dept") {
			propertiesToAdd.push({key:resultCol, value: String(qObj.get_dept())});
		} else if (keyField === "id") {
			propertiesToAdd.push({key:resultCol, value: String(qObj.get_id())});
		} else if (keyField === "instructor") {
			propertiesToAdd.push({key:resultCol, value: String(qObj.get_instructor())});
		} else if (keyField === "title") {
			propertiesToAdd.push({key:resultCol, value: String(qObj.get_title())});
		} else if (keyField === "uuid") {
			propertiesToAdd.push({key:resultCol, value: String(qObj.get_uuid())});
		}else if (keyField === "fullname") {
			propertiesToAdd.push({key:resultCol, value: String(qObj.getFullname())});
		} else if (keyField === "shortname") {
			propertiesToAdd.push({key:resultCol, value: String(qObj.getShortname())});
		} else if (keyField === "number") {
			propertiesToAdd.push({key:resultCol, value: String(qObj.getNumber())});
		} else if (keyField === "name") {
			propertiesToAdd.push({key:resultCol, value: String(qObj.getName())});
		} else if (keyField === "address") {
			propertiesToAdd.push({key:resultCol, value: String(qObj.getAddress())});
		} else if (keyField === "type") {
			propertiesToAdd.push({key:resultCol, value: String(qObj.getType())});
		} else if (keyField === "furniture") {
			propertiesToAdd.push({key:resultCol, value: String(qObj.getFurniture())});
		} else if (keyField === "href") {
			propertiesToAdd.push({key:resultCol, value: String(qObj.getHref())});
		}
	}
	return propertiesToAdd;
}


export function compare(val: string|number, val2: string|number, dir: string) {

	if (val < val2) {
		return dir === "UP" ? -1 : 1;
		// return -1;
	} else if (val > val2) {
		return dir === "UP" ? 1 : -1;
		// return 1;
	} else {
		return 0;
	}
}


export function convertArrayOfObjectToObject(properties: Property[]): object {
	let result: Record<string, string | number> = {};
	for (let property of properties) {
		result[property.key] = property.value;
	}
	// console.log(result);
	return result;
}

export function checkFieldsBasedOnDatasetKind(datasetKind: InsightDatasetKind, field: string): boolean {
	if (datasetKind === InsightDatasetKind.Sections) {
		let sfieldSections = ["dept", "id", "instructor", "title", "uuid"];
		let mfieldSection = ["avg", "pass", "fail", "audit", "year"];

		if (!sfieldSections.includes(field) && !mfieldSection.includes(field)) {
			return false;
		}

	} else if (datasetKind === InsightDatasetKind.Rooms) {
		let mfieldRooms = ["lat", "lon", "seats"];
		let sfieldRooms = ["fullname", "shortname", "number" , "name" , "address" ,
			"type" , "furniture" , "href"];

		if (!sfieldRooms.includes(field) && !mfieldRooms.includes(field)) {
			return false;
		}

	} else {
		return false;
	}

	return true;
}

export function checkMfieldsBasedOnKind(datasetKind: InsightDatasetKind, mfield: string): boolean {
	if (datasetKind === InsightDatasetKind.Sections) {
		let mfieldSection = ["avg", "pass", "fail", "audit", "year"];

		if (!mfieldSection.includes(mfield)) {
			return false;
		}

	} else if (datasetKind === InsightDatasetKind.Rooms) {
		let mfieldRooms = ["lat", "lon", "seats"];

		if (!mfieldRooms.includes(mfield)) {
			return false;
		}

	} else {
		return false;
	}
	return true;
}

export function checkSfieldsBasedOnKind(datasetKind: InsightDatasetKind, sfield: string): boolean {
	if (datasetKind === InsightDatasetKind.Sections) {
		let sfieldSections = ["dept", "id", "instructor", "title", "uuid"];

		if (!sfieldSections.includes(sfield)) {
			return false;
		}

	} else if (datasetKind === InsightDatasetKind.Rooms) {
		let sfieldRooms = ["fullname", "shortname", "number" , "name" , "address" ,
			"type" , "furniture" , "href"];

		if (!sfieldRooms.includes(sfield)) {
			return false;
		}

	} else {
		return false;
	}

	return true;
}


export function validateIdString(idString: string): boolean {
	// const regEx = /[a-zA-Z0-9[\]^]+/;
	if (idString.length === 0 ) {
		throw new InsightError("Invalid id string");
	}
	if (idString.includes("_")) {
		throw new InsightError("Invalid id string");
	}
	return true;
}

export function transformOrder(properties: Property[][], resultCols: Set<string>): object[] {
	let finalArr: object[] = [];
	// console.log(resultCols);

	if (properties.length === 0) {
		return [{}];
	}
	let keys = Object.keys(properties[0]);
	let keysToDelete: string[] = [];

	for (let key of keys) {
		if (!resultCols.has(properties[0][+key].key)) {
			keysToDelete.push(properties[0][+key].key);
		}
	}
	// console.log(keysToDelete);
	//
	// console.log("KEYS", keys);

	if (keysToDelete.length === 0) {
		for (let property of properties) {
			finalArr.push(convertArrayOfObjectToObject(property));
		}
	} else {
		for (let property of properties) {
			let newProps: Property[] = [];

			for (let p of property) {
				if (!keysToDelete.includes(p.key)) {
					newProps.push(p);
				}
			}
			finalArr.push(convertArrayOfObjectToObject(newProps));
		}
	}
	return finalArr;

}


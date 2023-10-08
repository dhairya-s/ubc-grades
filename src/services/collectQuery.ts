import InsightFacade from "../controller/InsightFacade";
import {InsightError, InsightResult} from "../controller/IInsightFacade";
import DatasetEntry from "../controller/DatasetEntry";
import SectionEntry from "../controller/SectionEntry";

interface Property {
	key: string,
	value: string | number
}
export default class CollectQuery {
	private query: object;
	private datasetEntries: DatasetEntry[] = [];
	private resultCols = new Set<string>();

	private sfield = ["dept", "id", "instructor", "title", "uuid"];
	private mfield = ["avg", "pass", "fail", "audit", "year"];

	constructor(query: object, datasetEntries: DatasetEntry[]) {
		this.query = query;
		this.datasetEntries = datasetEntries;
	}

	public async CollectQuery(): Promise<InsightResult[]> {
		let results: InsightResult[] = [];

		this.resultCols = this.collectOptions(this.query["OPTIONS" as keyof typeof this.query]);

		let r = this.collectBody(this.query["WHERE" as keyof typeof this.query]);
		// console.log("r", r);

		return r[0] as InsightResult[];
	}

	private collectBody(body: object): object[] {
		let keys: string[];
		keys = Object.keys(body);

		let propertiesToAdd: object[] = [];

		for (let key of keys) {
			if (key === "GT" || key === "LT" || key === "EQ") { // MCOMP
				propertiesToAdd.push(this.collectMCOMP(body[key as keyof typeof body], key));
			} else if (key === "AND" || key === "OR") { // LOGICCOMP
				propertiesToAdd.push(this.collectLOGICCOMP(body[key as keyof typeof body]));
			} else if (key === "IS") { // SCOMP
				propertiesToAdd.push(this.collectSCOMP(body[key as keyof typeof body]));
			} else if (key === "NOT") { // NEGATION
				propertiesToAdd.push(this.collectNEGATION(body[key as keyof typeof body]));
			} else {
				throw new InsightError("Invalid Query - Failed in Body");
			}
		}

		return propertiesToAdd;
	}

	private collectInsightResult(section: SectionEntry): Property[] {
		let propertiesToAdd: Property[] = [];
		for (let resultCol of this.resultCols) {
			let keyField = resultCol.split("_")[1];
			if (keyField === "avg") {
				propertiesToAdd.push({key:resultCol, value: section.get_avg()});
			} else if (keyField === "pass") {
				propertiesToAdd.push({key:resultCol, value: section.get_pass()});
			} else if (keyField === "fail") {
				propertiesToAdd.push({key:resultCol, value: section.get_fail()});
			} else if (keyField === "audit") {
				propertiesToAdd.push({key:resultCol, value: section.get_audit()});
			} else if (keyField === "year") {
				propertiesToAdd.push({key:resultCol, value: section.get_year()});
			} else if (keyField === "dept") {
				propertiesToAdd.push({key:resultCol, value: section.get_dept()});
			} else if (keyField === "id") {
				propertiesToAdd.push({key:resultCol, value: section.get_id()});
			} else if (keyField === "instructor") {
				propertiesToAdd.push({key:resultCol, value: section.get_instructor()});
			} else if (keyField === "title") {
				propertiesToAdd.push({key:resultCol, value: section.get_title()});
			} else if (keyField === "uuid") {
				propertiesToAdd.push({key:resultCol, value: section.get_uuid()});
			}
		}

		return propertiesToAdd;
	}

	private convertArrayOfObjectToObject(properties: Property[]): object {
		let result: Record<string, string | number> = {};
		for (let property of properties) {
			result[property.key] = property.value;
		}
		return result;
	}
	private applyGT(section: SectionEntry, value: number, sectionVal: number): object {
		let propertiesToAdd: Property[] = [];
		if (sectionVal > value) {
			propertiesToAdd = this.collectInsightResult(section);
		}
		return this.convertArrayOfObjectToObject(propertiesToAdd);
	}

	private applyEQ(section: SectionEntry, value: number, sectionVal: number): object {
		let propertiesToAdd: Property[] = [];
		if (sectionVal === value) {
			propertiesToAdd = this.collectInsightResult(section);
		}
		return this.convertArrayOfObjectToObject(propertiesToAdd);
	}

	private applyLT(section: SectionEntry, value: number, sectionVal: number): object {
		let propertiesToAdd: Property[] = [];
		if (sectionVal < value) {
			propertiesToAdd = this.collectInsightResult(section);
		}
		return this.convertArrayOfObjectToObject(propertiesToAdd);
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

	private collectMCOMP(mcomp: object, key: string): object[] {
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

	private collectLOGICCOMP(logiccomp: object): object[] {
		// let isValid = false;
		// let keys: string[];
		// keys = Object.keys(logiccomp);
		// console.log("Logic Comp", keys);
		// for (let key of keys) {
		// 	isValid = this.validateBody(logiccomp[key as keyof typeof logiccomp]);
		// }
		//
		// return isValid;
		return [];
	}

	private collectSCOMP(scomp: object): object[] {
		// let isValid = false;
		// let keys: string[];
		// keys = Object.keys(scomp);
		// console.log("SCOMP", keys);
		//
		// for (let key of keys) {
		// 	let skey = key.split("_");
		// 	if (skey.length !== 2) {
		// 		throw new InsightError("Invalid Query");
		// 	}
		// 	let isValidString = this.validateIdString(skey[0]);
		// 	if (!isValidString || !this.sfield.includes(skey[1])) {
		// 		throw new InsightError("Invalid Query");
		// 	}
		// 	try {
		// 		const value: string = scomp[key as keyof typeof scomp]; // fail if array or empty
		// 		if (typeof scomp[key as keyof typeof scomp] !== "string") {
		// 			throw new InsightError("Invalid Query");
		// 		}
		// 		isValid = this.validateInputString(value);
		// 		console.log("scomp val", value);
		// 	} catch (e) {
		// 		throw new InsightError("Invalid Query");
		// 	}
		// }
		// return isValid;
		return [];
	}

	private collectNEGATION(neg: object): object[]  {
		// let isValid = false;
		// let keys: string[];
		// keys = Object.keys(neg);
		// console.log("Negation", keys);
		//
		// if (keys.length > 1) {
		// 	throw new InsightError("Invalid Query");
		// }
		// isValid = this.validateBody(neg);
		//
		// return isValid;
		return [];
	}

	private collectOptions(options: object): Set<string>  {
		let resultCols = new Set<string>();
		resultCols.add(options["ORDER" as keyof  typeof options]);

		let cols: string[] = options["COLUMNS" as keyof  typeof options];
		for (let col of cols) {
			resultCols.add(col);
		}

		return resultCols;
	}
}

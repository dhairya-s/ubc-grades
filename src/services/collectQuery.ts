import InsightFacade from "../controller/InsightFacade";
import {InsightError, InsightResult} from "../controller/IInsightFacade";
import DatasetEntry from "../controller/DatasetEntry";
import SectionEntry from "../controller/SectionEntry";
import CollectMcomp from "./collectMcomp";
import {collectInsightResult, convertArrayOfObjectToObject} from "./collectionHelpers";

export interface Property {
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
		this.resultCols = this.collectOptions(this.query["OPTIONS" as keyof typeof this.query]);

		let r = this.collectBody(this.query["WHERE" as keyof typeof this.query]);
		console.log("r", r);

		return r[0] as InsightResult[];
	}

	private collectBody(body: object): object[] {
		let keys: string[];
		keys = Object.keys(body);

		let propertiesToAdd: object[] = [];

		let collectM = new CollectMcomp(this.datasetEntries, this.resultCols);

		for (let key of keys) {
			if (key === "GT" || key === "LT" || key === "EQ") { // MCOMP
				propertiesToAdd.push(collectM.collectMCOMP(body[key as keyof typeof body], key));
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

	private matchesExactly(section: SectionEntry, value: string, sectionVal: string): object {
		let propertiesToAdd: Property[] = [];
		if (sectionVal === value) {
			propertiesToAdd = collectInsightResult(section, this.resultCols);
		}
		return convertArrayOfObjectToObject(propertiesToAdd);
	}

	private endsWith(section: SectionEntry, value: string, sectionVal: string): object {
		let propertiesToAdd: Property[] = [];
		let split = value.split("*")[1];
		if (sectionVal.endsWith(split)) {
			propertiesToAdd = collectInsightResult(section, this.resultCols);
		}
		return convertArrayOfObjectToObject(propertiesToAdd);
	}

	private startsWith(section: SectionEntry, value: string, sectionVal: string): object {
		let propertiesToAdd: Property[] = [];
		let split = value.split("*")[0];
		if (sectionVal.startsWith(split)) {
			propertiesToAdd = collectInsightResult(section, this.resultCols);
		}
		return convertArrayOfObjectToObject(propertiesToAdd);
	}

	private contains(section: SectionEntry, value: string, sectionVal: string): object {
		let propertiesToAdd: Property[] = [];
		let split = value.split("*")[1];

		if (sectionVal.includes(split)) {
			propertiesToAdd = collectInsightResult(section, this.resultCols);
		}
		return convertArrayOfObjectToObject(propertiesToAdd);
	}

	private handleWildCards(section: SectionEntry, value: string, sectionValue: string): object {
		let result: object = {};

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
	private handleSFields(section: SectionEntry, localKeyField: string, value: string): object {
		let result: object = {};

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

	private collectSCOMP(scomp: object): object[] {
		let propertiesToAdd: object[] = [];

		let localKey: string[] = Object.keys(scomp);
		const localKeyField = localKey[0].split("_")[1];
		const value: string = scomp[localKey[0] as keyof typeof scomp];

		for (let dataset of this.datasetEntries) {
			for (let course of dataset.get_courses()) {
				for (let section of course.getSections()) {
					let obj = this.handleSFields(section, localKeyField, value);
					if (Object.keys(obj).length !== 0) {
						propertiesToAdd.push(obj);
					}
				}
			}
		}
		return propertiesToAdd;
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

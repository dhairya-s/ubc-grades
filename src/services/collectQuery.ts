import InsightFacade from "../controller/InsightFacade";
import {InsightError, InsightResult} from "../controller/IInsightFacade";
import DatasetEntry from "../controller/DatasetEntry";
import SectionEntry from "../controller/SectionEntry";
import CollectMcomp from "./collectMcomp";
import CollectScomp from "./collectScomp";
import CollectLogicComp from "./collectLogicComp";
import {collectInsightResult, compare} from "./collectionHelpers";

export interface Property {
	key: string,
	value: string | number
}
export default class CollectQuery {
	private query: object;
	private datasetEntries: DatasetEntry[] = [];
	// private resultCols = new Set<string>();

	constructor(query: object, datasetEntries: DatasetEntry[]) {
		this.query = query;
		this.datasetEntries = datasetEntries;
	}

	public async CollectQuery(): Promise<InsightResult[]> {
		let final: object[] = [];
		let resultCols: Set<string> = this.collectOptions(this.query["OPTIONS" as keyof typeof this.query]);

		let r: SectionEntry[] = this.collectBody(this.query["WHERE" as keyof typeof this.query], resultCols);

		let options = this.query["OPTIONS" as keyof typeof this.query];
		let orderCol: string | undefined = options["ORDER" as keyof  typeof options];

		if (orderCol !== undefined) {
			r = this.orderBy(r, orderCol);
		}
		for (let sec of r) {
			final.push(collectInsightResult(sec, resultCols));
		}

		return final as InsightResult[];
	}

	private orderBy(sections: SectionEntry[], orderCol: string): SectionEntry[] {
		let keyField = orderCol.split("_")[1];
		function orderCompare(section1: SectionEntry, section2: SectionEntry) {
			if (keyField === "avg") {
				return compare(section1.get_avg(), section2.get_avg());
			} else if (keyField === "pass") {
				return compare(section1.get_pass(), section2.get_pass());
			} else if (keyField === "fail") {
				return compare(section1.get_fail(), section2.get_fail());
			} else if (keyField === "audit") {
				return compare(section1.get_audit(), section2.get_audit());
			} else if (keyField === "year") {
				return compare(section1.get_year(), section2.get_year());
			} else if (keyField === "dept") {
				return compare(section1.get_dept(),section2.get_dept());
			} else if (keyField === "id") {
				return compare(section1.get_id(), section2.get_id());
			} else if (keyField === "instructor") {
				return compare(section1.get_instructor(), section2.get_instructor());
			} else if (keyField === "title") {
				return compare(section1.get_title(), section2.get_title());
			} else if (keyField === "uuid") {
				return compare(section1.get_uuid(), section2.get_uuid());
			}
			return 0;
		}
		return sections.sort(orderCompare);
	}

	public collectBody(body: object, resultCols: Set<string>): SectionEntry[] {
		let keys: string[];
		keys = Object.keys(body);

		let propertiesToAdd: SectionEntry[] = [];

		let collectM = new CollectMcomp(this.datasetEntries, resultCols);
		let collectS = new CollectScomp(this.datasetEntries, resultCols);
		let collectLogic = new CollectLogicComp(this.datasetEntries,  resultCols);
		for (let key of keys) {
			if (key === "GT" || key === "LT" || key === "EQ") { // MCOMP
				propertiesToAdd = collectM.collectMCOMP(body[key as keyof typeof body], key);
			} else if (key === "AND" || key === "OR") { // LOGICCOMP
				// console.log("key body", key);
				propertiesToAdd = collectLogic.collectLogicComp(body[key as keyof typeof body], key);
			} else if (key === "IS") { // SCOMP
				propertiesToAdd = collectS.collectSCOMP(body[key as keyof typeof body]);
			} else if (key === "NOT") { // NEGATION
				// propertiesToAdd = this.collectNEGATION(body[key as keyof typeof body]);
			} else {
				throw new InsightError("Invalid Query - Failed in Body");
			}
		}
		// console.log(propertiesToAdd);
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

		let cols: string[] = options["COLUMNS" as keyof  typeof options];
		for (let col of cols) {
			resultCols.add(col);
		}

		return resultCols;
	}
}

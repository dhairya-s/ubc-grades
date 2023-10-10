import InsightFacade from "../controller/InsightFacade";
import {InsightError, InsightResult} from "../controller/IInsightFacade";
import DatasetEntry from "../controller/DatasetEntry";
import SectionEntry from "../controller/SectionEntry";
import CollectMcomp from "./collectMcomp";
import CollectScomp from "./collectScomp";

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
		let collectS = new CollectScomp(this.datasetEntries, this.resultCols);

		for (let key of keys) {
			if (key === "GT" || key === "LT" || key === "EQ") { // MCOMP
				propertiesToAdd.push(collectM.collectMCOMP(body[key as keyof typeof body], key));
			} else if (key === "AND" || key === "OR") { // LOGICCOMP
				propertiesToAdd.push(this.collectLOGICCOMP(body[key as keyof typeof body]));
			} else if (key === "IS") { // SCOMP
				propertiesToAdd.push(collectS.collectSCOMP(body[key as keyof typeof body]));
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

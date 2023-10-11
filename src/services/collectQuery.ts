import InsightFacade from "../controller/InsightFacade";
import {InsightError, InsightResult} from "../controller/IInsightFacade";
import DatasetEntry from "../controller/DatasetEntry";
import SectionEntry from "../controller/SectionEntry";
import CollectMcomp from "./collectMcomp";
import CollectScomp from "./collectScomp";
import CollectLogicComp from "./collectLogicComp";

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
		let resultCols: Set<string> = this.collectOptions(this.query["OPTIONS" as keyof typeof this.query]);
		// console.log("Query result cols", resultCols);
		let r = this.collectBody(this.query["WHERE" as keyof typeof this.query], resultCols);

		return r[0] as InsightResult[];
	}

	public collectBody(body: object, resultCols: Set<string>): object[][] {
		let keys: string[];
		keys = Object.keys(body);

		let propertiesToAdd: object[][] = [];

		let collectM = new CollectMcomp(this.datasetEntries, resultCols);
		let collectS = new CollectScomp(this.datasetEntries, resultCols);
		let collectLogic = new CollectLogicComp(this.datasetEntries,  resultCols);
		for (let key of keys) {
			if (key === "GT" || key === "LT" || key === "EQ") { // MCOMP
				propertiesToAdd.push(collectM.collectMCOMP(body[key as keyof typeof body], key));
			} else if (key === "AND" || key === "OR") { // LOGICCOMP
				// console.log("key body", key);
				propertiesToAdd.push(collectLogic.collectLogicComp(body[key as keyof typeof body], key));
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

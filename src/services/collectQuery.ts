import InsightFacade from "../controller/InsightFacade";
import {InsightError, InsightResult, ResultTooLargeError} from "../controller/IInsightFacade";
import DatasetEntry from "../controller/DatasetEntry";
import SectionEntry from "../controller/SectionEntry";
import CollectMcomp from "./collectMcomp";
import CollectScomp from "./collectScomp";
import CollectLogicComp from "./collectLogicComp";
import {collectInsightResult, compare} from "./collectionHelpers";
import CollectAll from "./collectAll";
import CollectNegComp from "./collectNegComp";

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

		let r: SectionEntry[] = this.collectBody(this.query["WHERE" as keyof typeof this.query]);

		let options = this.query["OPTIONS" as keyof typeof this.query];
		let orderCol: string | undefined = options["ORDER" as keyof  typeof options];

		if (r.length >= 5000) {
			throw new ResultTooLargeError("Only queries with a maximum of 5000 results are supported");
		}
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

	public collectBody(body: object): SectionEntry[] {
		let keys: string[];
		keys = Object.keys(body);

		let propertiesToAdd: SectionEntry[] = [];

		let collectM = new CollectMcomp(this.datasetEntries);
		let collectS = new CollectScomp(this.datasetEntries);
		let collectLogic = new CollectLogicComp(this.datasetEntries);
		let collect = new CollectAll(this.datasetEntries);
		let collectNeg = new CollectNegComp(this.datasetEntries);

		if (keys.length === 0) {
			propertiesToAdd = collect.collectAllQueries();
		}
		for (let key of keys) {
			if (key === "GT" || key === "LT" || key === "EQ") { // MCOMP
				propertiesToAdd = collectM.collectMCOMP(body[key as keyof typeof body], key);
			} else if (key === "AND" || key === "OR") { // LOGICCOMP
				// console.log("key body", key);
				propertiesToAdd = collectLogic.collectLogicComp(body[key as keyof typeof body], key);
			} else if (key === "IS") { // SCOMP
				propertiesToAdd = collectS.collectSCOMP(body[key as keyof typeof body]);
			} else if (key === "NOT") { // NEGATION
				propertiesToAdd = collectNeg.collectNegComp(body[key as keyof typeof body]);
			} else {
				throw new InsightError("Invalid Query - Failed in Body");
			}
		}
		return propertiesToAdd;
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

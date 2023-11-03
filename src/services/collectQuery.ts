import {InsightDatasetKind, InsightError, InsightResult, ResultTooLargeError} from "../controller/IInsightFacade";
import SectionsDatasetEntry from "../serviceHelpers/datasetConstruction/sectionsDataset/SectionsDatasetEntry";
import SectionEntry from "../serviceHelpers/datasetConstruction/sectionsDataset/SectionEntry";
import CollectMcomp from "../serviceHelpers/queryEngine/collectMcomp";
import CollectScomp from "../serviceHelpers/queryEngine/collectScomp";
import CollectLogicComp from "../serviceHelpers/queryEngine/collectLogicComp";
import {
	collectInsightResult,
	compare,
	convertArrayOfObjectToObject,
	transformOrder
} from "../serviceHelpers/helpers/collectionHelpers";
import CollectAll from "../serviceHelpers/queryEngine/collectAll";
import CollectNegComp from "../serviceHelpers/queryEngine/collectNegComp";
import {TransformQuery} from "../serviceHelpers/queryEngine/transformQuery";
import {DatasetEntry} from "../serviceHelpers/datasetConstruction/DatasetEntry";
import QueryObject from "../serviceHelpers/datasetConstruction/QueryObject";

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

	public async CollectQuery(datasetId: string, datasetKind: InsightDatasetKind): Promise<InsightResult[]> {
		let final: object[] = [];
		let resultCols: Set<string> = this.collectOptions(this.query["OPTIONS" as keyof typeof this.query]);
		// console.log(resultCols);
		// we collect the body
		let r: QueryObject[] = this.collectBody(this.query["WHERE" as keyof typeof this.query], datasetId, datasetKind);

		let propertiesToAdd: Property[][] = [];
		if (Object.keys(this.query).includes("TRANSFORMATIONS")) {
			let transform = new TransformQuery(r);
			propertiesToAdd = transform.TransformQuery(this.query["TRANSFORMATIONS" as keyof typeof this.query]);

			let options = this.query["OPTIONS" as keyof typeof this.query];
			let orderCol: string | object | undefined = options["ORDER" as keyof  typeof options];

			if (orderCol === undefined) {
				// we have properties to add [[{}],[{}],[{}]]
				final = transformOrder(propertiesToAdd, resultCols);
				return final as InsightResult[];
			}

			return [] as InsightResult[];

		} else {
			// based on the options and the order, we create a final array
			let options = this.query["OPTIONS" as keyof typeof this.query];
			let orderCol: string | object | undefined = options["ORDER" as keyof  typeof options];

			if (r.length >= 5000) {
				throw new ResultTooLargeError("Only queries with a maximum of 5000 results are supported");
			}
			if (orderCol !== undefined) {
				r = this.orderBy(r, orderCol);
			}
			for (let sec of r) {
				final.push(convertArrayOfObjectToObject(collectInsightResult(sec, resultCols)));
			}

			// return the final array
			return final as InsightResult[];
		}


	}

	private orderBy(sections: QueryObject[], orderCol: string): QueryObject[] {
		let keyField = orderCol.split("_")[1];
		function orderCompare(section1: QueryObject, section2: QueryObject) {
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
			} else if (keyField === "lat") {
				return compare(section1.getLat(), section2.getLat());
			} else if (keyField === "lon") {
				return compare(section1.getLon(), section2.getLon());
			} else if (keyField === "seats") {
				return compare(section1.getSeats(), section2.getSeats());
			} else if (keyField === "fullname") {
				return compare(section1.getFullname(), section2.getFullname());
			} else if (keyField === "shortname") {
				return compare(section1.getShortname(), section2.getShortname());
			} else if (keyField === "number") {
				return compare(section1.getNumber(), section2.getNumber());
			} else if (keyField === "name") {
				return compare(section1.getName(), section2.getName());
			} else if (keyField === "address") {
				return compare(section1.getAddress(), section2.getAddress());
			} else if (keyField === "type") {
				return compare(section1.getType(), section2.getType());
			} else if (keyField === "furniture") {
				return compare(section1.getFurniture(), section2.getFurniture());
			} else if (keyField === "href") {
				return compare(section1.getHref(), section2.getHref());
			}
			return 0;
		}
		return sections.sort(orderCompare);
	}

	public collectBody(body: object, datasetId: string, datasetKind: InsightDatasetKind): QueryObject[] {
		let keys: string[];
		keys = Object.keys(body);

		let propertiesToAdd: QueryObject[] = [];

		let collectM = new CollectMcomp(this.datasetEntries);
		let collectS = new CollectScomp(this.datasetEntries);
		let collectLogic = new CollectLogicComp(this.datasetEntries);
		let collect = new CollectAll(this.datasetEntries);
		let collectNeg = new CollectNegComp(this.datasetEntries);

		if (keys.length === 0) {
			propertiesToAdd = collect.collectAllQueries(datasetId);
		}
		for (let key of keys) {
			if (key === "GT" || key === "LT" || key === "EQ") { // MCOMP
				propertiesToAdd = collectM.collectMCOMP(body[key as keyof typeof body], key, datasetId);
			} else if (key === "AND" || key === "OR") { // LOGICCOMP
				// console.log("key body", key);
				propertiesToAdd = collectLogic.collectLogicComp(body[key as keyof typeof body],
					key, datasetId, datasetKind);
			} else if (key === "IS") { // SCOMP
				propertiesToAdd = collectS.collectSCOMP(body[key as keyof typeof body], datasetId);
			} else if (key === "NOT") { // NEGATION
				propertiesToAdd = collectNeg.collectNegComp(body[key as keyof typeof body], datasetId, datasetKind);
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

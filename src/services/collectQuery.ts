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

			final = transformOrder(propertiesToAdd, resultCols);

			console.log();

			if (orderCol === undefined) {
				// we have properties to add [[{}],[{}],[{}]]
				final = transformOrder(propertiesToAdd, resultCols);
				return final as InsightResult[];
			}
			final = this.collectSort(orderCol, true, final);
			return final as InsightResult[];

		} else {
			// based on the options and the order, we create a final array
			let options: object = this.query["OPTIONS" as keyof typeof this.query];
			let orderCol: string | object | undefined = options["ORDER" as keyof  typeof options];

			if (r.length >= 5000) {
				throw new ResultTooLargeError("Only queries with a maximum of 5000 results are supported");
			}
			if (orderCol !== undefined) {
				if (typeof orderCol === "string") {
					r = this.orderBy(r, [orderCol], "UP");
				} else if (typeof orderCol === "object"){
					let dir: string = orderCol["dir" as keyof typeof orderCol];
					let cols: string[] = orderCol["keys" as keyof typeof orderCol];
					r = this.orderBy(r, cols, dir);
				}

			}
			for (let sec of r) {
				final.push(convertArrayOfObjectToObject(collectInsightResult(sec, resultCols)));
			}

			// return the final array
			return final as InsightResult[];
		}


	}

	private orderBy(sections: QueryObject[], orderCol: string[], dir: string): QueryObject[] {
		let keyField = orderCol[0].split("_")[1];
		let helper = this.helper;
		function orderCompare(section1: QueryObject, section2: QueryObject) {
			let arr = helper(keyField, section1, section2);
			if (arr !== undefined){
				let c = compare(arr[0], arr[1], dir);
				if (c === 0) {
					for (let i = 1; i < orderCol.length; i++) {
						let childKeyField = orderCol[i].split("_")[1];
						let childArr = helper(childKeyField, section1, section2);
						if (childArr !== undefined) {
							let childC = compare(childArr[0], childArr[1], dir);
						}
					}
					return c;
				} else {
					return c;
				}
			} else {
				return 0;
			}
		}

		return sections.sort(orderCompare);
	}

	private helper(field: string, section1: QueryObject, section2: QueryObject) {
		if (field === "avg") {
			return [section1.get_avg(), section2.get_avg()];
		} else if (field === "pass") {
			return [section1.get_pass(), section2.get_pass()];
		} else if (field === "fail") {
			return [section1.get_fail(), section2.get_fail()];
		} else if (field === "audit") {
			return [section1.get_audit(), section2.get_audit()];
		} else if (field === "year") {
			return [section1.get_year(), section2.get_year()];
		} else if (field === "dept") {
			return [section1.get_dept(),section2.get_dept()];
		} else if (field === "id") {
			return [section1.get_id(), section2.get_id()];
		} else if (field === "instructor") {
			return [section1.get_instructor(), section2.get_instructor()];
		} else if (field === "title") {
			return [section1.get_title(), section2.get_title()];
		} else if (field === "uuid") {
			return [section1.get_uuid(), section2.get_uuid()];
		} else if (field === "lat") {
			return [section1.getLat(), section2.getLat()];
		} else if (field === "lon") {
			return [section1.getLon(), section2.getLon()];
		} else if (field === "seats") {
			return [section1.getSeats(), section2.getSeats()];
		} else if (field === "fullname") {
			return [section1.getFullname(), section2.getFullname()];
		} else if (field === "shortname") {
			return [section1.getShortname(), section2.getShortname()];
		} else if (field === "number") {
			return [section1.getNumber(), section2.getNumber()];
		} else if (field === "name") {
			return [section1.getName(), section2.getName()];
		} else if (field === "address") {
			return [section1.getAddress(), section2.getAddress()];
		} else if (field === "type") {
			return [section1.getType(), section2.getType()];
		} else if (field === "furniture") {
			return [section1.getFurniture(), section2.getFurniture()];
		} else if (field === "href") {
			return [section1.getHref(), section2.getHref()];
		}
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

	private collectSort(order: object | string, hasTransformations: boolean, objArr: object[]) {
		if (order === undefined) {
			return [];
		}
		let outputObjArr: object[] = [];
		if (typeof order === "string") {
			if (hasTransformations) {
				outputObjArr = this.transOrderBy([order], objArr, "UP");
			}
		} else if (typeof order === "object") {
			if (hasTransformations) {
				let dir: string = order["dir" as keyof typeof order];
				let cols: string[] = order["keys" as keyof typeof order];
				outputObjArr = this.transOrderBy(cols, objArr, dir);

			}
		}
		return outputObjArr;
	}

	private transOrderBy(order: string[], objArr: object[], dir: string) {
		let firstOrder = order[0];
		function orderCompare(val1: object, val2: object) {
			let c = compare(val1[firstOrder as keyof typeof val1],val2[firstOrder as keyof typeof val2], dir);
			if (c === 0) {
				for (let i = 1; i < order.length; i++) {
					let childC = compare(val1[order[i] as keyof typeof val1],val2[order[i] as keyof typeof val2], dir);
					if (childC !== 0) {
						return childC;
					}
				}
				return c;
			} else {
				return c;
			}
		}
		return objArr.sort(orderCompare);
	}

}

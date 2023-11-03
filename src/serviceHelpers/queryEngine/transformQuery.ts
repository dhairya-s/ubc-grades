import SectionEntry from "../datasetConstruction/sectionsDataset/SectionEntry";
import Decimal from "decimal.js";
import {Property} from "../../services/collectQuery";
import {collectInsightResult} from "../helpers/collectionHelpers";
import QueryObject from "../datasetConstruction/QueryObject";

export class TransformQuery {
	private collectedQuery: QueryObject[];
	constructor(collectedQuery: QueryObject[]) {
		this.collectedQuery = collectedQuery;
	}

	public TransformQuery(transform: object) {
		let propertiesToAdd: Property[][] = [];

		// handle group
		// let tempSecReturn: SectionEntry[] = [];
		let groupMap: Map<string, QueryObject[]> = new Map<string, SectionEntry[]>();
		let group: string[] = transform["GROUP" as keyof typeof transform];
		groupMap = this.handleGroup(group);
		// console.log("Group handled");

		propertiesToAdd = this.handleApply(transform["APPLY" as keyof typeof transform],group, groupMap);

		if (propertiesToAdd.length === 0 ) {
			for (let key of groupMap.keys()) {
				let propsToAdd: Property[] = [];

				let sectionEntries = groupMap.get(key);
				if (sectionEntries !== undefined) {
					let groupSet: Set<string> = new Set(group);
					propsToAdd = collectInsightResult(sectionEntries[0], groupSet);
					propertiesToAdd.push(propsToAdd);
				}
			}
		}

		return propertiesToAdd;
	}

	private handleGroup(group: string[]) {
		let groupMap = new Map<string, SectionEntry[]>();

		for (let section of this.collectedQuery) {
			let groupKey: string = JSON.stringify(returnsArray(section));

			if (groupMap.has(groupKey)) {
				let groupedSections = groupMap.get(groupKey);
				if (groupedSections === undefined) {
					groupedSections = [section];
				} else {
					groupedSections.push(section);
				}
				groupMap.set(groupKey, groupedSections);
			} else {
				groupMap.set(groupKey, [section]);
			}
		}

		function returnsArray (section: SectionEntry) {
			let retArr: Array<string|number> = [];
			for (let keyList of group) {
				let keyField = keyList.split("_")[1];
				if (keyField === "avg") {
					retArr.push(section.get_avg());
				} else if (keyField === "pass") {
					retArr.push(section.get_pass());
				} else if (keyField === "fail") {
					retArr.push(section.get_fail());
				} else if (keyField === "audit") {
					retArr.push(section.get_audit());
				} else if (keyField === "year") {
					retArr.push(section.get_year());
				} else if (keyField === "dept") {
					retArr.push(section.get_dept());
				} else if (keyField === "id") {
					retArr.push(section.get_id());
				} else if (keyField === "instructor") {
					retArr.push(section.get_instructor());
				} else if (keyField === "title") {
					retArr.push(section.get_title());
				} else if (keyField === "uuid") {
					retArr.push(String(section.get_uuid()));
				}
			}
			return retArr;

		}
		return groupMap;
	}

	private handleApply(apply: object[], group: string[], groupMap: Map<string, QueryObject[]>) {
		let propertiesToAdd: Property[][] = [];

		for (let ap of apply) {
			let applyKey = Object.keys(ap)[0];

			let rule: object = ap[applyKey as keyof typeof ap];

			let applyToken: string = Object.keys(rule)[0];
			let applyCol: string = rule[applyToken as keyof typeof rule];
			let applyColField: string = applyCol.split("_")[1];

			if (applyToken === "MIN") {
				propertiesToAdd = this.handleMin(applyColField, applyKey, group, groupMap);
			} else if (applyToken === "MAX") {
				propertiesToAdd = this.handleMax(applyColField, applyKey, group,groupMap);
			}  else if (applyToken === "AVG") {
				propertiesToAdd = this.handleAvg(applyColField, applyKey, group,groupMap);
			}  else if (applyToken === "SUM") {
				propertiesToAdd = this.handleSum(applyColField, applyKey, group,groupMap);
			}  else if (applyToken === "COUNT") {
				propertiesToAdd = this.handleCount(applyColField, applyKey, group,groupMap);
			}
		}
		return propertiesToAdd;
	}


	private handleMin(applyColField: string, applyKey: string, group: string[], groupMap: Map<string, QueryObject[]>) {
		let propertiesToAdd: Property[][] = [];

		for (let key of groupMap.keys()) {
			let min = +Infinity;
			let propsToAdd: Property[] = [];

			let sectionEntries = groupMap.get(key);
			if (sectionEntries !== undefined) {
				for (let section of sectionEntries) {
					let val = this.handleNumericApplyCols(applyColField, section);
					if (val < min) {
						min = val;
					}
				}
				let groupSet = new Set(group);
				propsToAdd = collectInsightResult(sectionEntries[0], groupSet);
				propsToAdd.push({key: applyKey, value:min});
				propertiesToAdd.push(propsToAdd);
			}
		}

		return propertiesToAdd;
	}

	private handleMax(applyColField: string, applyKey: string,group: string[],groupMap: Map<string, QueryObject[]>) {
		let propertiesToAdd: Property[][] = [];

		for (let key of groupMap.keys()) {
			let max = -Infinity;
			let propsToAdd: Property[] = [];

			let queryObjects = groupMap.get(key);
			if (queryObjects !== undefined) {
				for (let queryObject of queryObjects) {
					let val = this.handleNumericApplyCols(applyColField, queryObject);
					if (val > max) {
						max = val;
					}
				}
				let groupSet = new Set(group);
				propsToAdd = collectInsightResult(queryObjects[0], groupSet);
				propsToAdd.push({key: applyKey, value:max});
				propertiesToAdd.push(propsToAdd);

			}
		}

		return propertiesToAdd;
	}

	private handleAvg(applyColField: string, applyKey: string,group: string[], groupMap: Map<string, SectionEntry[]>) {
		let propertiesToAdd: Property[][] = [];

		for (let key of groupMap.keys()) {
			let total = new Decimal(0);
			let numRows = 0;
			let propsToAdd: Property[] = [];

			let queryObjects = groupMap.get(key);
			if (queryObjects !== undefined) {
				for (let queryObject of queryObjects) {
					let val = new Decimal(this.handleNumericApplyCols(applyColField, queryObject));
					// console.log("val", val);
					total = Decimal.add(total, val);
					// console.log("total",total);
					numRows++;
				}
				let avg = total.toNumber() / numRows;

				let groupSet = new Set(group);
				propsToAdd = collectInsightResult(queryObjects[0], groupSet);
				propsToAdd.push({key: applyKey, value:Number(avg.toFixed(2))});
				propertiesToAdd.push(propsToAdd);
			}
		}

		return propertiesToAdd;
	}

	private handleSum(applyColField: string, applyKey: string,group: string[],groupMap: Map<string, QueryObject[]>) {
		let propertiesToAdd: Property[][] = [];

		for (let key of groupMap.keys()) {
			let total = new Decimal(0);
			let propsToAdd: Property[] = [];

			let queryObjects = groupMap.get(key);
			if (queryObjects !== undefined) {
				for (let queryObject of queryObjects) {
					let val = new Decimal(this.handleNumericApplyCols(applyColField, queryObject));
					total.add(val);
				}
				let groupSet = new Set(group);
				propsToAdd = collectInsightResult(queryObjects[0], groupSet);
				propsToAdd.push({key: applyKey, value:Number(total.toFixed(2))});
				propertiesToAdd.push(propsToAdd);
			}
		}

		return propertiesToAdd;
	}


	private handleCount(applyColField: string, applyKey: string,group: string[],groupMap: Map<string, SectionEntry[]>){
		let propertiesToAdd: Property[][] = [];

		for (let key of groupMap.keys()) {
			let count = 0;
			let propsToAdd: Property[] = [];

			let sectionEntries = groupMap.get(key);
			if (sectionEntries !== undefined) {
				for (let section of sectionEntries) {
					count++;
				}
				let groupSet = new Set(group);
				propsToAdd = collectInsightResult(sectionEntries[0], groupSet);
				propsToAdd.push({key: applyKey, value:count});
				propertiesToAdd.push(propsToAdd);
			}
		}

		return propertiesToAdd;
	}


	private handleNumericApplyCols(applyColField: string, qObj: QueryObject): number {
		let val = 0;
		if (applyColField === "avg") {
			val = section.get_avg();
		} else if (applyColField === "pass") {
			val = section.get_pass();
		} else if (applyColField === "fail") {
			val = section.get_fail();
		} else if (applyColField === "audit") {
			val = section.get_audit();
		} else if (applyColField === "year") {
			val = section.get_year();
		}

		return val;
	}

}

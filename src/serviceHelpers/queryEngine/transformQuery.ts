import SectionEntry from "../datasetConstruction/sectionsDataset/SectionEntry";
import Decimal from "decimal.js";
import {Property} from "../../services/collectQuery";
import {collectInsightResult, compare} from "../helpers/collectionHelpers";
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
		let groupMap = new Map<string, QueryObject[]>();

		for (let section of this.collectedQuery) {
			let groupKey: string = JSON.stringify(this.returnsArray(group, section));

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

		return groupMap;
	}

	private returnsArray(group: string[],qObj: QueryObject) {
		let retArr: Array<string|number> = [];
		for (let keyList of group) {
			let keyField = keyList.split("_")[1];
			if (keyField === "avg") {
				retArr.push(qObj.get_avg());
			} else if (keyField === "pass") {
				retArr.push(qObj.get_pass());
			} else if (keyField === "fail") {
				retArr.push(qObj.get_fail());
			} else if (keyField === "audit") {
				retArr.push(qObj.get_audit());
			} else if (keyField === "year") {
				retArr.push(qObj.get_year());
			} else if (keyField === "dept") {
				retArr.push(qObj.get_dept());
			} else if (keyField === "id") {
				retArr.push(qObj.get_id());
			} else if (keyField === "instructor") {
				retArr.push(qObj.get_instructor());
			} else if (keyField === "title") {
				retArr.push(qObj.get_title());
			} else if (keyField === "uuid") {
				retArr.push(String(qObj.get_uuid()));
			} else if (keyField === "lat") {
				retArr.push(qObj.getLat());
			} else if (keyField === "lon") {
				retArr.push(qObj.getLon());
			} else if (keyField === "seats") {
				retArr.push(qObj.getSeats());
			} else if (keyField === "fullname") {
				retArr.push(String(qObj.getFullname()));
			} else if (keyField === "shortname") {
				retArr.push(String(qObj.getShortname()));
			} else if (keyField === "number") {
				retArr.push(String(qObj.getNumber()));
			} else if (keyField === "name") {
				retArr.push(String(qObj.getName()));
			} else if (keyField === "address") {
				retArr.push(String(qObj.getAddress()));
			} else if (keyField === "type") {
				retArr.push(String(qObj.getType()));
			} else if (keyField === "furniture") {
				retArr.push(String(qObj.getFurniture()));
			} else if (keyField === "href") {
				retArr.push(String(qObj.getHref()));
			}
		}
		return retArr;
	}

	private handleApply(apply: object[], group: string[], groupMap: Map<string, QueryObject[]>) {
		let propertiesToAdd: Property[][] = [];
		let applyKeys: string[] = [];
		let applyTokens: string[] = [];
		let applyColFields: string [] = [];
		for (let ap of apply) {
			let applyKey = Object.keys(ap)[0];
			let rule: object = ap[applyKey as keyof typeof ap];
			let applyToken: string = Object.keys(rule)[0];
			let applyCol: string = rule[applyToken as keyof typeof rule];
			let applyColField: string = applyCol.split("_")[1];

			applyKeys.push(applyKey);
			applyTokens.push(applyToken);
			applyColFields.push(applyColField);
		}

		propertiesToAdd = this.applyHelper(applyKeys, applyTokens, applyColFields, group, groupMap);

		return propertiesToAdd;
	}

	private applyHelper(applyKeys: string[], applyTokens: string[], applyColFields: string[], group: string[],
		groupMap: Map<string, QueryObject[]>) {
		let propertiesToAdd: Property[][] = [];

		for (let key of groupMap.keys()) {

			let propsToAdd: Property[] = [];

			let sectionEntries = groupMap.get(key);
			if (sectionEntries !== undefined) {
				let groupSet = new Set(group);
				propsToAdd = collectInsightResult(sectionEntries[0], groupSet);


				propsToAdd = this.transformApplyTokenHelpers(applyKeys, applyTokens, applyColFields,
					sectionEntries, propsToAdd);

				propertiesToAdd.push(propsToAdd);
			}
		}
		return propertiesToAdd;
	}

	private transformApplyTokenHelpers(applyKeys: string[], applyTokens: string[], applyColFields: string[]
		, sectionEntries: QueryObject[], propsToAdd: Property[]): Property[] {
		for (let i = 0; i < applyKeys.length;i++) {
			let min = +Infinity;
			let max = -Infinity;
			let total = new Decimal(0);
			let numRows = 0;
			if (applyTokens[i] === "MIN") {
				for (let section of sectionEntries) {
					let val = this.handleNumericApplyCols(applyColFields[i], section);
					if (val < min) {
						min = val;
					}
				}
				propsToAdd.push({key: applyKeys[i], value:min});
			} else if (applyTokens[i] === "MAX") {
				for (let section of sectionEntries) {
					let val = this.handleNumericApplyCols(applyColFields[i], section);
					if (val > max) {
						max = val;
					}
				}
				propsToAdd.push({key: applyKeys[i], value:max});
			} else if (applyTokens[i] === "AVG") {
				for (let section of sectionEntries) {
					let val = new Decimal(this.handleNumericApplyCols(applyColFields[i], section));
					total = Decimal.add(total, val);
					numRows++;
				}
				let avg = total.toNumber() / numRows;
				propsToAdd.push({key: applyKeys[i], value:Number(avg.toFixed(2))});
			} else if (applyTokens[i] === "SUM") {
				for (let section of sectionEntries) {
					let val = new Decimal(this.handleNumericApplyCols(applyColFields[i], section));
					total = Decimal.add(total, val);
				}
				propsToAdd.push({key: applyKeys[i], value:Number(total.toFixed(2))});
			} else if (applyTokens[i] === "COUNT") {
				for (let section of sectionEntries) {
					numRows++;
				}
				propsToAdd.push({key: applyKeys[i], value:numRows});
			}
		}
		return propsToAdd;
	}

	private handleNumericApplyCols(applyColField: string, qObj: QueryObject): number {
		let val = 0;
		if (applyColField === "avg") {
			val = qObj.get_avg();
		} else if (applyColField === "pass") {
			val = qObj.get_pass();
		} else if (applyColField === "fail") {
			val = qObj.get_fail();
		} else if (applyColField === "audit") {
			val = qObj.get_audit();
		} else if (applyColField === "year") {
			val = qObj.get_year();
		}  else if (applyColField === "lat") {
			val = qObj.getLat();
		} else if (applyColField === "lon") {
			val = qObj.getLon();
		} else if (applyColField === "seats") {
			val = qObj.getSeats();
		}

		return val;
	}

}

import SectionEntry from "../datasetConstruction/sectionsDataset/SectionEntry";

export class TransformQuery {
	private collectedQuery: SectionEntry[];
	constructor(collectedQuery: SectionEntry[]) {
		this.collectedQuery = collectedQuery;
	}

	public TransformQuery(transform: object) {
		// handle group
		let tempSecReturn: SectionEntry[] = [];
		let groupMap: Map<string, SectionEntry[]> = new Map<string, SectionEntry[]>();
		groupMap = this.handleGroup(transform["GROUP" as keyof typeof transform]);
		console.log("Group handled");

		for (let g of groupMap.keys()) {
			let sec = groupMap.get(g);
			if (sec === undefined) {
				continue;
			} else {
				tempSecReturn.push(sec[0]);
			}

		}

		return tempSecReturn;
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

	private handleApply(apply: object[], groupMap: Map<string, SectionEntry[]>) {
		for (let ap of apply) {
			let applyKey = Object.keys(ap)[0];

			let rule: object = ap[applyKey as keyof typeof ap];

			let applyToken: string = Object.keys(rule)[0];
			let applyCol: string = rule[applyToken as keyof typeof rule];

			// if (applyToken === "MIN") {
			// 	handleMin(applyCol, groupMap);
			// } else if (applyToken === "MAX") {
			// 	handleMax(applyCol, groupMap);
			// }  else if (applyToken === "AVG") {
			// 	handleAvg(applyCol, groupMap);
			// }  else if (applyToken === "SUM") {
			// 	handleSum(applyCol, groupMap);
			// }  else if (applyToken === "COUNT") {
			// 	handleCount(applyCol, groupMap);
			// }
		}

		//
		// function handleMin(applyCol: string, groupMap: Map<string, SectionEntry[]>) {
		//
		// }
		//
		// function handleMax(applyCol: string, groupMap: Map<string, SectionEntry[]>) {
		//
		// }
		//
		// function handleAvg(applyCol: string, groupMap: Map<string, SectionEntry[]>) {
		//
		// }
		//
		// function handleSum(applyCol: string, groupMap: Map<string, SectionEntry[]>) {
		//
		// }
		//
		// function handleCount(applyCol: string, groupMap: Map<string, SectionEntry[]>){
		//
		// }
	}


}

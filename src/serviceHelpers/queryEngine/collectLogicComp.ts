import CollectQuery from "../../services/collectQuery";
import {DatasetEntry} from "../datasetConstruction/DatasetEntry";
import QueryObject from "../datasetConstruction/QueryObject";
import {InsightDatasetKind} from "../../controller/IInsightFacade";

export default class CollectLogicComp {
	private datasetEntries: DatasetEntry[] = [];

	constructor(datasetEntries: DatasetEntry[]) {
		this.datasetEntries = datasetEntries;
	}

	public collectLogicComp(logiccomp: object, key: string, datasetId: string,
		datasetKind: InsightDatasetKind): QueryObject[] {
		// let start = performance.now();
		// console.log("key logic", key);
		let propertiesToAdd: QueryObject[] = [];
		let propertiesToLogic: QueryObject[][] = [];
		let localKeys: string[] = Object.keys(logiccomp); // 0,1,2,3

		for (let locakKey of localKeys) {
			let collectQuery = new CollectQuery(logiccomp[locakKey as keyof typeof logiccomp],
				this.datasetEntries);
			let collectComp: QueryObject[];
			collectComp = collectQuery.collectBody(logiccomp[locakKey as keyof typeof logiccomp],
				datasetId, datasetKind);
			// if (Object.keys(collectComp).length !== 0){
			propertiesToLogic.push(collectComp);
			// }
		}

		// let set = new SetWithContentEquality<SectionEntry>((section) => section.get_uuid());
		// for (let section of propertiesToLogic) {
		// 	// console.log("section", section);
		// 	for (let s of section) {
		// 		// console.log("s", s);
		// 		set.add(s);
		// 	}
		// }

		// let end1 = performance.now();
		// console.log("LogicComp", (end1 - start) / 1000);
		if (key === "AND") {
			propertiesToAdd = this.handleAndComp(propertiesToLogic, datasetKind);
		} else if (key === "OR") {
			propertiesToAdd = this.handleOrComp(propertiesToLogic, datasetKind);
		}

		return propertiesToAdd;
	}

	// TODO: rename sections to qObj
	private handleAndComp(propertiesToLogic: QueryObject[][], datasetKind: InsightDatasetKind): QueryObject[] {
		let map = new Map<string, QueryObject>();
		let lenProps = propertiesToLogic.length;
		let arrOfUuid = new Map<string, boolean>();
		let hashMap = new Map<string, number>();

		for (let section of propertiesToLogic) {
			for (let s of section) {
				let numberOfOccurances;
				if (datasetKind === InsightDatasetKind.Sections) {
					numberOfOccurances = hashMap.get(String(s.get_uuid()));
					if (numberOfOccurances !== undefined) {
						hashMap.set(String(s.get_uuid()), numberOfOccurances + 1);
					} else {
						hashMap.set(String(s.get_uuid()), 1);
					}
				} else if (datasetKind === InsightDatasetKind.Rooms) {
					numberOfOccurances = hashMap.get(String(s.getName()));
					if (numberOfOccurances !== undefined) {
						hashMap.set(String(s.getName()), numberOfOccurances + 1);
					} else {
						hashMap.set(String(s.getName()), 1);
					}
				}
			}
		}
		for (let key of hashMap.keys()) {
			if (hashMap.get(key) === lenProps) {
				arrOfUuid.set(String(key), true);
			}
		}

		let sections = propertiesToLogic[0];
		for (let section of sections) {
			if (datasetKind === InsightDatasetKind.Sections) {
				if (arrOfUuid.has(String(section.get_uuid()))) {
					if (!map.has(String(section.get_uuid()))) {
						map.set(section.get_uuid(), section);
					}
				}
			} else if (datasetKind === InsightDatasetKind.Rooms) {
				if (arrOfUuid.has(String(section.getName()))) {
					if (!map.has(String(section.getName()))) {
						map.set(section.getName(), section);
					}
				}
			}
		}
		return Array.from(map.values());
	}

	private handleOrComp(propertiesToLogic: QueryObject[][], datasetKind: InsightDatasetKind): QueryObject[] {
		// let start = performance.now();

		// let set = new SetWithContentEquality<SectionEntry>((section) => section.get_uuid());
		//
		// for (let section of propertiesToLogic) {
		// 	for (let s of section) {
		// 		set.add(s);
		// 	}
		// }

		let map = new Map<string, QueryObject>();
		for (const sections of propertiesToLogic) {
			for (const s of sections) {
				if (datasetKind === InsightDatasetKind.Sections) {
					if (!map.has(String(s.get_uuid()))) {
						map.set(s.get_uuid(), s);
					}
				} else if (datasetKind === InsightDatasetKind.Rooms) {
					if (!map.has(String(s.getName()))) {
						map.set(s.getName(), s);
					}
				}
			}
		}

		// let end1 = performance.now();
		// console.log("OR:", (end1 - start) / 1000);

		return Array.from(map.values());
	}


}

class SetWithContentEquality<T> {
	private items: T[] = [];
	private getKey: (item: T) => string;
	constructor(getKey: (item: T) => string) {
		this.getKey = getKey;
	}

	public add(item: T): void {
		const key = this.getKey(item);
		if (!this.items.some((existing) => this.getKey(existing) === key)) {
			this.items.push(item);
		}
	}

	public has(item: T): boolean {
		return this.items.some((existing) => this.getKey(existing) === this.getKey(item));
	}

	public values(): T[] {
		return [...this.items];
	}
}

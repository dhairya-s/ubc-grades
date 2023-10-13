import DatasetEntry from "../controller/DatasetEntry";
import SectionEntry from "../controller/SectionEntry";
import CollectQuery from "./collectQuery";
import {log} from "util";

export default class CollectLogicComp {
	private datasetEntries: DatasetEntry[] = [];

	constructor(datasetEntries: DatasetEntry[]) {
		this.datasetEntries = datasetEntries;
	}

	public collectLogicComp(logiccomp: object, key: string): SectionEntry[] {
		// let start = performance.now();
		// console.log("key logic", key);
		let propertiesToAdd: SectionEntry[] = [];
		let propertiesToLogic: SectionEntry[][] = [];
		let localKeys: string[] = Object.keys(logiccomp); // 0,1,2,3

		for (let locakKey of localKeys) {
			let collectQuery = new CollectQuery(logiccomp[locakKey as keyof typeof logiccomp], this.datasetEntries);
			let collectComp: SectionEntry[];
			collectComp = collectQuery.collectBody(logiccomp[locakKey as keyof typeof logiccomp]);
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
			// propertiesToAdd = this.handleAndComp(propertiesToLogic);
		} else if (key === "OR") {
			propertiesToAdd = this.handleOrComp(propertiesToLogic);
		}

		return propertiesToAdd;
	}

	private handleAndComp(propertiesToLogic: SectionEntry[][]): SectionEntry[] {
		// let start = performance.now();

		// let set = new SetWithContentEquality<SectionEntry>((section) => section.get_uuid());
		let map = new Map<string, SectionEntry>();

		let lenProps = propertiesToLogic.length;
		// console.log(lenProps);
		let arrOfUuid: string[] = [];
		let hashMap = new Map<string, number>();

		for (let section of propertiesToLogic) {
			for (let s of section) {
				let numberOfOccurances = hashMap.get(String(s.get_uuid()));
				if (numberOfOccurances !== undefined) {
					hashMap.set(String(s.get_uuid()), numberOfOccurances + 1);
				} else {
					hashMap.set(String(s.get_uuid()), 1);
				}
			}
		}
		// let end1 = performance.now();
		// console.log((end1 - start) / 1000);

		for (let key of hashMap.keys()) {
			if (hashMap.get(key) === lenProps) {
				arrOfUuid.push(String(key));
			}
		}

		// let end2 = performance.now();
		// console.log((end2 - end1) / 1000);

		let sections = propertiesToLogic[0];
		for (let section of sections) {
			for (let a of arrOfUuid) {
				if (String(section.get_uuid()) === a) {
					if (!map.has(String(section.get_uuid()))) {
						map.set(section.get_uuid(), section);
					}
				}

			}
		}
		//
		// for (let section of propertiesToLogic) {
		// 	for (let s of section) {
		// 		for (let a of arrOfUuid) {
		// 			if (String(s.get_uuid()) === a) {
		// 				set.add(s);
		// 			}
		// 		}
		// 	}
		// }

		// let end3 = performance.now();
		// console.log((end3 - end2) / 1000);


		//
		// return propertiesToLogic.slice(1).reduce((prev, curr) => {
		// 	return prev.filter((obj1) => {
		// 		return curr.some((obj2) => (obj1.get_uuid() === obj2.get_uuid())
		// 		);
		// 	});
		// },propertiesToLogic[0]);

		return Array.from(map.values());
	}

	private handleOrComp(propertiesToLogic: SectionEntry[][]): SectionEntry[] {
		let start = performance.now();

		// let set = new SetWithContentEquality<SectionEntry>((section) => section.get_uuid());
		//
		// for (let section of propertiesToLogic) {
		// 	for (let s of section) {
		// 		set.add(s);
		// 	}
		// }

		let map = new Map<string, SectionEntry>();
		for (const sections of propertiesToLogic) {
			for (const s of sections) {
				if (!map.has(String(s.get_uuid()))) {
					map.set(s.get_uuid(), s);
				}
			}
		}

		let end1 = performance.now();
		console.log("OR:", (end1 - start) / 1000);

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

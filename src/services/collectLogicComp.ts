import DatasetEntry from "../controller/DatasetEntry";
import SectionEntry from "../controller/SectionEntry";
import CollectQuery from "./collectQuery";
import {log} from "util";

export default class CollectLogicComp {
	private datasetEntries: DatasetEntry[] = [];
	private resultCols: Set<string>;

	constructor(datasetEntries: DatasetEntry[], resultCols: Set<string>) {
		this.datasetEntries = datasetEntries;
		this.resultCols = resultCols;
		// console.log("Logic result cols", this.resultCols);
	}

	public collectLogicComp(logiccomp: object, key: string): SectionEntry[] {
		// console.log("key logic", key);
		let propertiesToAdd: SectionEntry[] = [];
		let propertiesToLogic: SectionEntry[][] = [];
		let localKeys: string[] = Object.keys(logiccomp); // 0,1,2,3

		for (let locakKey of localKeys) {
			let collectQuery = new CollectQuery(logiccomp[locakKey as keyof typeof logiccomp], this.datasetEntries);
			let collectComp: SectionEntry[];
			collectComp = collectQuery.collectBody(logiccomp[locakKey as keyof typeof logiccomp], this.resultCols);
			// if (Object.keys(collectComp).length !== 0){
			propertiesToLogic.push(collectComp);
			// }
		}

		if (key === "AND") {
			propertiesToAdd = this.handleAndComp(propertiesToLogic);
		} else if (key === "OR") {
			propertiesToAdd = this.handleOrComp(propertiesToLogic);
		}

		return propertiesToAdd;
	}

	private handleAndComp(propertiesToLogic: SectionEntry[][]): SectionEntry[] {
		//
		// for (let prop of propertiesToLogic) {
		// 	console.log(prop.length);
		// }

		// [
		// 		[
		// 			{"section_id":"id", "section_num": 31},
		// 			{"section_id":"id2", "section_num": 89}
		// 		],
		// 		[
		// 			{section_id:"id2", "section_num": 89}
		// 		]
		// ]
		//
		// return value
		// [
		// 			{"section_id":"id2", "section_num": 89}
		// ]

		//
		// for (let props of propertiesToLogic) {
		// 	for (let objs of props) {
		//
		// 	}
		// }
		// return []

		let temp = propertiesToLogic.slice(1).reduce((prev, curr) => {
			return prev.filter((obj1) => {
				return curr.some((obj2) => (obj1.get_uuid() === obj2.get_uuid())
				);
			});
		},propertiesToLogic[0]);

		return temp;
	}


	// private valueIsEq(obj: object ) {
	//
	// }
	// private compareObjects(obj1: object, obj2:  object): boolean {
	// 	for (let col of this.resultCols) {
	// 		if (obj1[ as keyof typeof obj1] !== obj2[col as keyof typeof obj2]) {
	// 			return false;
	// 		}
	// 	}
	// 	return true;
	// }

	private handleOrComp(propertiesToLogic: SectionEntry[][]): SectionEntry[] {
		return [];
	}
}

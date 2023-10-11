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

	public collectLogicComp(logiccomp: object, key: string): object[] {
		// console.log("key logic", key);
		let propertiesToAdd: object[] = [];
		let propertiesToLogic: object[][] = [];
		let localKeys: string[] = Object.keys(logiccomp);

		for (let locakKey of localKeys) {
			let collectQuery = new CollectQuery(logiccomp[locakKey as keyof typeof logiccomp], this.datasetEntries);
			let collectComp: object[][];
			collectComp = collectQuery.collectBody(logiccomp[locakKey as keyof typeof logiccomp], this.resultCols);
			if (Object.keys(collectComp).length !== 0){
				propertiesToLogic.push(collectComp[0]);
			}
		}

		if (key === "AND") {
			propertiesToAdd.push(this.handleAndComp(propertiesToLogic));
		} else if (key === "OR") {
			propertiesToAdd.push(this.handleOrComp(propertiesToLogic));
		}

		return propertiesToAdd;
	}

	private handleAndComp(propertiesToLogic: object[][]): object[] {

		console.log(propertiesToLogic);

		// // console.log("properties to logic", propertiesToLogic);
		// return propertiesToLogic.reduce((prev, curr) => {
		// 	return prev.filter((obj1) => {
		// 		return curr.filter((obj2) => (this.compareObjects(obj1, obj2))
		// 	);
		// 	});
		// });
		return [];
	}

	private compareObjects(obj1: object, obj2: object): boolean {
		let isEq = false;
		for (let col of this.resultCols) {
			if (obj1[col as keyof typeof obj1] === obj2[col as keyof typeof obj2]) {
				isEq = true;
			}
			if (!isEq) {
				break;
			}
		}
		return isEq;
	}

	private handleOrComp(propertiesToLogic: object[][]): object[] {
		return [];
	}
}

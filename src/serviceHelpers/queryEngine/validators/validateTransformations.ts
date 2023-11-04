import {InsightDatasetKind, InsightError} from "../../../controller/IInsightFacade";
import {
	checkFieldsBasedOnDatasetKind,
	checkMfieldsBasedOnKind,
	validateIdString
} from "../../helpers/collectionHelpers";

// 98,105,115,130,154-157,165
export default class ValidateTransformations {
	private tf: object;
	private datasetKind: InsightDatasetKind;

	private datasetId: string = "";
	private allowedColumns: string[] = [];
	private APPLYTOKEN_NUMERIC: string[] = ["MAX", "MIN", "AVG", "SUM"];
	private APPLYTOKEN_ALL: string[] = ["COUNT"];


	constructor(tf: object, datasetKind: InsightDatasetKind) {
		this.tf = tf;
		this.datasetKind = datasetKind;
	}

	public Validate(): boolean {
		let isValid = false;
		let hasGroup = false;
		let hasApply = false;
		let keys: string[];
		keys = Object.keys(this.tf); // ['GROUP', 'APPLY']

		for (let key of keys) {
			if (key === "GROUP") { // cannot be empty
				hasGroup = true;
				isValid = this.validateGroup(this.tf[key as keyof typeof this.tf], this.datasetKind);
				if (!isValid) {
					return isValid;
				}
			} else if (key === "APPLY") { // can be empty
				hasApply = true;
				isValid = this.validateApply(this.tf[key as keyof typeof this.tf], this.datasetKind);
				if (!isValid) {
					return isValid;
				}
			} else {
				return false;
			}
		}
		if (!hasApply || !hasGroup) {
			throw new InsightError("Invalid Query");
		}

		return isValid;
	}

	private validateGroup(group: string[], datasetKind: InsightDatasetKind): boolean {
		let isValid = false;

		let datasetIds: string[] = [];

		// keys can repeat
		for (let keyList of group) {
			let datasetId: string = keyList.split("_")[0];
			let field: string = keyList.split("_")[1];

			// each key of keylist in group, check if it has correct sfield or mfield
			// based on sections or rooms as datasetId
			isValid = checkFieldsBasedOnDatasetKind(datasetKind, field);
			if (!isValid) {
				return false;
			}

			this.setAllowedColumns(keyList);
			datasetIds.push(datasetId);
		}
		if (datasetIds.length === 0) {
			return false; // group cannot be empty
		}

		isValid = datasetIds.every((id)=> id === datasetIds[0]);

		if (this.getDatasetId() === "") {
			this.setDatasetId(datasetIds[0]); // if isValid is false, program will error out anyways
		} else {
			if (this.getDatasetId() !== datasetIds[0]) {
				return false;
			}
		}

		return isValid;
	}

	private validateApply(apply: object[], datasetKind: InsightDatasetKind): boolean {
		let applyKey: string = "";

		for (let ap of apply) {
			let keys: string[] = Object.keys(ap);
			if (keys.length > 1) {
				return false; // doesnt reach here
			}

			applyKey = keys[0];

			// apply key cant be empty or have underscore (same as id string)
			if (!validateIdString(applyKey)) {
				return false; // doesnt reach here
			}

			if (!this.validateApplyRule(ap[applyKey as keyof typeof ap], datasetKind)) {
				return false;
			}


			// duplicate apply keys not allowed
			if (this.getAllowedColumns().includes(applyKey)) {
				return false; // doesnt reach here
			} else {
				this.setAllowedColumns(applyKey);
			}
		}

		return true;
	}

	private validateApplyRule(rule: object, datasetKind: InsightDatasetKind): boolean {
		let isValid = false;
		let applyToken = "";

		let keys: string[] = Object.keys(rule);
		if (keys.length > 1) {
			return false;
		}

		applyToken = keys[0];
		// console.log(applyToken); // AVG (applytoken)

		// isValid = this.APPLYTOKEN.includes(applyToken);
		// if (!isValid) {
		// 	return isValid;
		// }

		let col: string = rule[applyToken as keyof typeof rule];

		let colDatasetId: string = col.split("_")[0];
		let colField: string = col.split("_")[1];

		if (this.APPLYTOKEN_NUMERIC.includes(applyToken)) {
			isValid = checkMfieldsBasedOnKind(datasetKind, colField);
			if (!isValid) {
				return isValid;
			}
		} else if (this.APPLYTOKEN_ALL.includes(applyToken)) {
			isValid = checkFieldsBasedOnDatasetKind(datasetKind, colField);
			if (!isValid) {
				return isValid;
			}
		} else {
			return false;
		}


		if (this.getDatasetId() !== "") {
			if (colDatasetId === this.getDatasetId()) {
				isValid = true;
			} else {
				isValid = false;
			}
		} else {
			this.setDatasetId(colDatasetId);
			isValid = true;
		}


		return isValid;
	}

	public getDatasetId(): string {
		return this.datasetId;
	}

	private setDatasetId(id: string) {
		this.datasetId = id;
	}

	public getAllowedColumns(): string [] {
		return this.allowedColumns;
	}

	private setAllowedColumns(col: string) {
		this.allowedColumns.push(col);
	}
}

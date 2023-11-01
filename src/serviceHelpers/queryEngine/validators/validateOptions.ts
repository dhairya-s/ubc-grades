import {InsightDatasetKind, InsightError} from "../../../controller/IInsightFacade";
import {checkFieldsBasedOnDatasetKind, validateIdString} from "../../helpers/collectionHelpers";

export default class ValidateOptions {
	private options: object;
	private hasTf: boolean;
	private datasetKind: InsightDatasetKind;
	private allowedColumns: string[];
	private datasetId: string = "";
	private requiredColumns: string[] = [];
	constructor(options: object, hasTransformations: boolean, datasetKind: InsightDatasetKind,
		allowedCols: string[], datasetId: string) {
		this.options = options;
		this.hasTf = hasTransformations;
		this.datasetKind = datasetKind;
		this.allowedColumns = allowedCols;
		this.datasetId = datasetId;
	}

	public Validate(): boolean {
		let isValid: boolean = false;
		let keys: string[];
		keys = Object.keys(this.options);

		let validKeys = ["COLUMNS", "ORDER"];
		isValid = keys.every((key) => validKeys.includes(key));
		if (!isValid) {
			return isValid;
		}

		isValid = this.validateOrder(this.options["ORDER" as keyof typeof this.options], this.hasTf, this.datasetKind);
		if (!isValid) {
			return isValid;
		}

		isValid = this.validateColumns(this.options["COLUMNS" as keyof typeof this.options],
			this.hasTf, this.datasetKind);
		if (!isValid) {
			return isValid;
		}

		return isValid;
	}

	private validateOrder(order: object | string, hasTransformations: boolean, datasetKind: InsightDatasetKind) {
		if (order === undefined) {
			return true;
		}

		if (typeof order === "string") {
			if (hasTransformations) {
				if (!this.allowedColumns.includes(order)) {
					return false;
				}
				this.setRequiredColumns(order);
			} else {
				let datasetId = order.split("_")[0];
				let field = order.split("_")[1];

				if (!validateIdString(datasetId) || !checkFieldsBasedOnDatasetKind(datasetKind, field)) {
					return false;
				}
				if (this.getDatasetId() === "") {
					this.setDatasetId(datasetId);
				} else {
					if (this.getDatasetId() !== datasetId) {
						return false;
					}
				}
				this.setRequiredColumns(order);
			}
		} else if (typeof order === "object") {
			// validate sort
			const validKeys = ["dir", "keys"];
			let keys: string[] = Object.keys(order);
			if (!keys.every((key) => validKeys.includes(key))) {
				return false;
			}

			let isValid = this.validateSort(order["dir" as keyof typeof order],
				order["keys" as keyof typeof order], hasTransformations, datasetKind);
			if (!isValid) {
				return false;
			}
		}
		return true;
	}

	private validateSort(dir: string, cols: string[], hasTransformations: boolean, datasetKind: InsightDatasetKind) {
		if (dir !== "UP" && dir !== "DOWN") {
			return false;
		}
		if (hasTransformations) {
			for (let col of cols) {
				if (!this.allowedColumns.includes(col)) {
					return false;
				}
				this.setRequiredColumns(col);
			}
		} else {
			for (let col of cols) {
				let datasetId = col.split("_")[0];
				let field = col.split("_")[1];

				if (!validateIdString(datasetId) || !checkFieldsBasedOnDatasetKind(datasetKind, field)) {
					return false;
				}
				if (this.datasetId === "") {
					this.setDatasetId(datasetId);
				} else {
					if (this.getDatasetId() !== datasetId) {
						return false;
					}
				}
				this.setRequiredColumns(col);
			}
		}
		return true;
	}

	private validateColumns(cols: string[], hasTransformations: boolean, datasetKind: InsightDatasetKind): boolean {
		if (cols.length === 0) {
			return false;
		}

		if (this.getRequiredColumns().length > 0) {
			if (!this.requiredColumns.every((col) => cols.includes(col))) {
				return false;
			}
		}

		for (let col of cols) {
			if (hasTransformations) {
				if (!this.allowedColumns.includes(col)) {
					return false;
				}
			} else {
				let datasetId = col.split("_")[0];
				let field = col.split("_")[1];

				let isValidId = validateIdString(datasetId);

				if (!isValidId || !checkFieldsBasedOnDatasetKind(datasetKind, field)) {
					throw new InsightError("Invalid Query");
				}

				if (this.getDatasetId() !== "") {
					if (this.getDatasetId() !== datasetId) {
						return false;
					}
				} else {
					this.setDatasetId(datasetId);
				}
			}
		}

		return true;
	}

	public getDatasetId(): string {
		return this.datasetId;
	}

	private setDatasetId(id: string) {
		this.datasetId = id;
	}

	private getRequiredColumns(): string [] {
		return this.requiredColumns;
	}

	private setRequiredColumns(col: string) {
		this.requiredColumns.push(col);
	}

}

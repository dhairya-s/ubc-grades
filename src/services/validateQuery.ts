import {InsightDatasetKind, InsightError} from "../controller/IInsightFacade";
import {
	checkMfieldsBasedOnKind,
	checkSfieldsBasedOnKind,
	validateIdString
} from "../serviceHelpers/helpers/collectionHelpers";
import ValidateTransformations from "../serviceHelpers/queryEngine/validators/validateTransformations";
import ValidateOptions from "../serviceHelpers/queryEngine/validators/validateOptions";

// Use sections kind instead of dataset id
//
//
//
export default class ValidateQuery {
	private query: object;
	private datasetId: string = "";
	private expectedKeys = ["WHERE", "OPTIONS", "TRANSFORMATIONS"];

	private allowedColumns: string[] = [];

	constructor(query: object) {
		this.query = query;
	}

	public ValidateQuery(datasetKind: InsightDatasetKind): boolean {
		let hasTransformations: boolean = false;
		let isValid = false;
		let keys: string[];

		keys = Object.keys(this.query);

		isValid = keys.every((key)=> this.expectedKeys.includes(key));
		if (!isValid) {
			return isValid;
		}

		if (keys.includes("TRANSFORMATIONS")) { // need to add allowedColumns
			// check transformations
			let validateTransformations =
				new ValidateTransformations(this.query["TRANSFORMATIONS" as keyof typeof this.query], datasetKind);
			isValid = validateTransformations.Validate();

			if (!isValid) {
				return isValid;
			}

			this.setAllowedColumns(validateTransformations.getAllowedColumns());
			this.setDatasetId(validateTransformations.getDatasetId());
			hasTransformations = true;
		}

		// console.log("Valid Transform");

		// check options
		let validateOptions = new ValidateOptions(this.query["OPTIONS" as keyof typeof this.query],
			hasTransformations, datasetKind, this.getAllowedColumns(), this.getDatasetId());
		isValid = validateOptions.Validate();
		if (!isValid) {
			return isValid;
		}
		this.setDatasetId(validateOptions.getDatasetId());

		// console.log("Valid Options");

		// check where
		isValid = this.validateBody(this.query["WHERE" as keyof typeof this.query], datasetKind, this.getDatasetId());
		if (!isValid) {
			return isValid;
		}

		// console.log("Valid Body");

		return isValid;
	}

	private validateBody(body: object, datasetKind: InsightDatasetKind, datasetId: string): boolean {
		let isValid = true;
		let keys: string[];
		keys = Object.keys(body);
		// console.log("Body", keys);

		for (let key of keys) {
			if (key === "GT" || key === "LT" || key === "EQ") { // MCOMP
				isValid = this.validateMCOMP(body[key as keyof typeof body], datasetKind, datasetId);
				if (!isValid) {
					return isValid;
				}
			} else if (key === "AND" || key === "OR") { // LOGICCOMP
				isValid = this.validateLOGICCOMP(body[key as keyof typeof body], datasetKind,datasetId);
				if (!isValid) {
					return isValid;
				}
			} else if (key === "IS") { // SCOMP
				isValid = this.validateSCOMP(body[key as keyof typeof body], datasetKind,datasetId);
				if (!isValid) {
					return isValid;
				}
			} else if (key === "NOT") { // NEGATION
				isValid = this.validateNEGATION(body[key as keyof typeof body], datasetKind,datasetId);
				if (!isValid) {
					return isValid;
				}
			} else {
				throw new InsightError("Invalid Query");
			}
		}

		return isValid;
	}

	private validateMCOMP(mcomp: object, datasetKind: InsightDatasetKind, datasetId: string): boolean {
		let isValid = false;
		let keys: string[];
		keys = Object.keys(mcomp);
		// console.log("MCOMP", keys);


		for (let key of keys) {
			let mkey = key.split("_");

			if (mkey.length !== 2) {
				throw new InsightError("Invalid Query");
			}
			let isValidString = mkey[0] === String(datasetId);
			if (!isValidString || !checkMfieldsBasedOnKind(datasetKind, mkey[1])) {
				throw new InsightError("Invalid Query");
			}

			try {
				const value: number = mcomp[key as keyof typeof mcomp]; // fail if numeric string or array or empty
				if (typeof mcomp[key as keyof typeof mcomp] !== "number") {
					throw new InsightError("Invalid Query");
				}
				// console.log("MCOMP val", value);
				isValid = true;
				if (!isValid) {
					return isValid;
				}
			} catch (e) {
				throw new InsightError("Invalid Query");
			}
		}
		return isValid;
	}

	private validateLOGICCOMP(logiccomp: object, datasetKind: InsightDatasetKind, datasetId: string): boolean {
		let isValid = false;
		let keys: string[];
		keys = Object.keys(logiccomp);

		for (let key of keys) {
			isValid = this.validateBody(logiccomp[key as keyof typeof logiccomp], datasetKind, datasetId);
			if (!isValid) {
				return isValid;
			}
		}

		return isValid;
	}

	private validateSCOMP(scomp: object, datasetKind: InsightDatasetKind, datasetId: string): boolean {
		let isValid = false;
		let keys: string[];
		keys = Object.keys(scomp);
		// console.log("SCOMP", keys);

		for (let key of keys) {
			let skey = key.split("_");
			if (skey.length !== 2) {
				throw new InsightError("Invalid Query");
			}

			let isValidString = skey[0] === String(datasetId); // instead check if matches dataset id
			if (!isValidString || !checkSfieldsBasedOnKind(datasetKind,skey[1])) {
				throw new InsightError("Invalid Query");
			}
			try {
				const value: string = scomp[key as keyof typeof scomp]; // fail if array or empty
				if (typeof scomp[key as keyof typeof scomp] !== "string") {
					throw new InsightError("Invalid Query");
				}
				isValid = this.validateInputString(value);
				if (!isValid) {
					return isValid;
				}
			} catch (e) {
				throw new InsightError("Invalid Query");
			}
		}
		return isValid;
	}

	private validateNEGATION(neg: object, datasetKind: InsightDatasetKind, datasetId: string): boolean  {
		let isValid = false;
		let keys: string[];
		keys = Object.keys(neg);
		// console.log("Negation", keys);

		if (keys.length > 1) {
			throw new InsightError("Invalid Query");
		}
		isValid = this.validateBody(neg, datasetKind, datasetId);

		return isValid;
	}

	private validateInputString(inputString: string): boolean  { // implement
		// const regEx = /^ *$|^([* A-Za-z0-9[^\]][ A-Za-z0-9[^\]]*[* A-Za-z0-9[^\]]|[* A-Za-z0-9[^\]])$/;
		const regEx = /^[*]?[^*]*[*]?$/;
		if (!regEx.test(inputString)) {
			throw new InsightError("Invalid input string");
		}
		return true;
	}

	public getPreliminaryDatasetId(): string {
		let datasetId = "";
		let options: object = this.query["OPTIONS" as keyof typeof this.query];

		datasetId = getDatasetIdFromCols(options);
		if (datasetId === "") { // apply may have the dataset id
			datasetId = this.prelimDatasetIdHelper();
		}
		function getDatasetIdFromCols(obj: object): string {
			let dtId = "";
			let cols: string[] = obj["COLUMNS" as keyof typeof obj];
			for (let col of cols) {
				let fields = col.split("_");
				if (fields.length === 2) {
					dtId = fields[0];
					break;
				}
			}
			return dtId;
		}
		return datasetId;
	}

	private prelimDatasetIdHelper(): string {
		let dtId = "";
		let tf: object = this.query["TRANSFORMATIONS" as keyof typeof this.query];
		let grpCols: string[] = tf["GROUP" as keyof typeof tf];
		for (let col of grpCols) {
			let fields = col.split("_");
			if (fields.length === 2) {
				dtId = fields[0];
				break;
			}
		}
		return dtId;
	}

	public getDatasetId(): string {
		return this.datasetId;
	}

	private setDatasetId(id: string) {
		this.datasetId = id;
	}

	private getAllowedColumns(): string [] {
		return this.allowedColumns;
	}

	private setAllowedColumns(cols: string[]) {
		this.allowedColumns = cols;
	}
}

import InsightFacade from "../controller/InsightFacade";
import {InsightError} from "../controller/IInsightFacade";

export default class ValidateQuery {
	private query: object;
	private sfield = ["dept", "id", "instructor", "title", "uuid"];
	private mfield = ["avg", "pass", "fail", "audit", "year"];

	constructor(query: object) {
		this.query = query;
	}

	public validateQuery(): boolean {
		let hasBody: boolean = false;
		let hasOptions: boolean = false;
		let isValid = false;
		let keys: string[];

		keys = Object.keys(this.query);

		for (let key of keys) {
			if (key === "WHERE") {
				hasBody = true;
				isValid = this.validateBody(this.query[key as keyof typeof this.query]);
			} else if (key === "OPTIONS") {
				hasOptions = true;
				isValid = this.validateOptions(this.query[key as keyof typeof this.query]);
			} else {
				if (!hasBody) {
					throw new InsightError("WHERE not found");
				} else if (!hasOptions) {
					throw new InsightError("OPTIONS not found");
				} else {
					throw new InsightError("Invalid Query");
				}
			}
		}

		if (!hasBody) {
			throw new InsightError("WHERE not found");
		} else if (!hasOptions) {
			throw new InsightError("OPTIONS not found");
		}

		return isValid;
	}

	private validateBody(body: object): boolean {
		let isValid = false;
		let keys: string[];
		keys = Object.keys(body);
		console.log("Body", keys);

		for (let key of keys) {
			if (key === "GT" || key === "LT" || key === "EQ") { // MCOMP
				isValid = this.validateMCOMP(body[key as keyof typeof body]);
			} else if (key === "AND" || key === "OR") { // LOGICCOMP
				isValid = this.validateLOGICCOMP(body[key as keyof typeof body]);
			} else if (key === "IS") { // SCOMP
				isValid = this.validateSCOMP(body[key as keyof typeof body]);
			} else if (key === "NOT") { // NEGATION
				isValid = this.validateNEGATION(body[key as keyof typeof body]);
			} else {
				throw new InsightError("Invalid Query");
			}
		}

		return isValid;
	}

	private validateMCOMP(mcomp: object): boolean {
		let isValid = false;
		let keys: string[];
		keys = Object.keys(mcomp);
		console.log("MCOMP", keys);


		for (let key of keys) {
			let mkey = key.split("_");

			if (mkey.length !== 2) {
				throw new InsightError("Invalid Query");
			}
			let isValidString = this.validateIdString(mkey[0]);
			if (!isValidString || !this.mfield.includes(mkey[1])) {
				throw new InsightError("Invalid Query");
			}

			try {
				const value: number = mcomp[key as keyof typeof mcomp]; // fail if numeric string or array or empty
				console.log("MCOMP val", value);
				isValid = true;
			} catch (e) {
				throw new InsightError("Invalid Query");
			}
		}
		return isValid;
	}

	private validateLOGICCOMP(logiccomp: object): boolean {
		let isValid = false;
		let keys: string[];
		keys = Object.keys(logiccomp);
		console.log("Logic Comp", keys);
		for (let key of keys) {
			isValid = this.validateBody(logiccomp[key as keyof typeof logiccomp]);
		}

		return isValid;
	}

	private validateSCOMP(scomp: object): boolean {
		let isValid = false;
		let keys: string[];
		keys = Object.keys(scomp);
		console.log("SCOMP", keys);

		for (let key of keys) {
			let skey = key.split("_");
			if (skey.length !== 2) {
				throw new InsightError("Invalid Query");
			}
			let isValidString = this.validateIdString(skey[0]);
			if (!isValidString || !this.sfield.includes(skey[1])) {
				throw new InsightError("Invalid Query");
			}
			try {
				const value: string = scomp[key as keyof typeof scomp]; // fail if array or empty
				isValid = this.validateInputString(value);
				console.log("scomp val", value);
			} catch (e) {
				throw new InsightError("Invalid Query");
			}
		}
		return isValid;
	}

	private validateNEGATION(neg: object): boolean  {
		let isValid = false;
		let keys: string[];
		keys = Object.keys(neg);
		console.log("Negation", keys);

		if (keys.length > 1) {
			throw new InsightError("Invalid Query");
		}
		isValid = this.validateBody(neg);

		return isValid;
	}

	private validateOptions(options: object): boolean  {
		let isValid: boolean = false;
		let keys: string[];
		keys = Object.keys(options);
		let hasCols: boolean = false;
		console.log(keys);
		for (let key of keys) {
			if (key === "COLUMNS") {
				hasCols = true;
				isValid = this.validateColumns(options[key as keyof typeof options]);
			} else if (key === "ORDER") {
				isValid = this.validateOrder(options[key as keyof typeof options]);
			} else {
				throw new InsightError("Incorrect Options");
			}
		}

		if (!hasCols) {
			throw new InsightError("Options missing columns");
		}

		return isValid;
	}

	private validateColumns(cols: string[]): boolean {
		let isValid = false;
		for (let col of cols) {
			let val = col.split("_");
			let isValidId = this.validateIdString(val[0]);

			if (!isValidId || (!this.mfield.includes(val[1]) && !this.sfield.includes(val[1]))) {
				throw new InsightError("Invalid Query");
			}
		}

		isValid = true;
		return isValid;
	}

	private validateOrder(order: string) {
		let isValid = false;
		let val = order.split("_");
		let isValidId = this.validateIdString(val[0]);

		if (!isValidId || (!this.mfield.includes(val[1]) && !this.sfield.includes(val[1]))) {
			throw new InsightError("Invalid Query");
		}
		isValid = true;
		return isValid;
	}

	private validateIdString(idString: string): boolean {
		const regEx = /[^a-zA-Z0-9[\]^]+/;
		return !regEx.test(idString); // if false, throw error
	}

	private validateInputString(inputString: string): boolean  { // implement
		const regEx = /^([*A-Za-z[^\]][A-Za-z[^\]]*[*A-Za-z[^\]]|[*A-Za-z[^\]])$/;
		return !regEx.test(inputString); // if false, throw error
	}
}

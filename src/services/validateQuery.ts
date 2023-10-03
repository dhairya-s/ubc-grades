import InsightFacade from "../controller/InsightFacade";
import {InsightError} from "../controller/IInsightFacade";

export default class ValidateQuery {
	private query: object;
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
		const mfield = ["avg", "pass", "fail", "audit", "year"];
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
			if (!isValidString || !mfield.includes(mkey[1])) {
				throw new InsightError("Invalid Query");
			}

			try {
				const value: number = mcomp[key as keyof typeof mcomp];
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
		const sfield = ["dept", "id", "instructor", "title", "uuid"];
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
			if (!isValidString || !sfield.includes(skey[1])) {
				throw new InsightError("Invalid Query");
			}
			try {
				const value: string = scomp[key as keyof typeof scomp];
				isValid = this.validateInputString(value);
				console.log("scomp val", value);
			} catch (e) {
				throw new InsightError("Invalid Query");
			}
		}
		return isValid;
	}

	private validateInputString(inputString: string): boolean  { // implement
		return true;
	}
	private validateNEGATION(neg: object): boolean  {
		let isValid = false;
		let keys: string[];
		keys = Object.keys(neg);
		console.log("Negation", keys);

		for (let key in keys) {
			isValid = this.validateBody(neg[key as keyof typeof neg]);
		}

		return isValid;
	}

	private validateOptions(options: object): boolean  {
		console.log(options);
		return true;
	}

	private validateIdString(idString: string): boolean {
		const regEx = /[^a-zA-Z0-9[\]^]+/;
		return !regEx.test(idString);
	}
}

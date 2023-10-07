import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	ResultTooLargeError
} from "./IInsightFacade";
import {isBooleanObject} from "util/types";
import CourseEntry from "./CourseEntry";
import base = Mocha.reporters.base;
import DatasetEntry from "./DatasetEntry";
import JSZip from "jszip";
import ValidateQuery from "../services/validateQuery";

export default class InsightFacade implements IInsightFacade{
	private datasets: DatasetEntry[] = [];
	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if (!this.validateId(id)) {
			return Promise.reject(new InsightError("Invalid ID was given to addDataset. " +
                "Try an ID without an underscore."));
		} else if (!this.validateKind(kind)) {
			return Promise.reject(new InsightError("addDataset was given a 'rooms' kind when it only accepts " +
                "'sections'."));
		}
		let parsedContent = await this.parseContent(content);
		let contentValid = this.validateContent(parsedContent);
		console.log(contentValid);
		if (contentValid !== "valid") {
			return Promise.reject(contentValid); // Reject with custom message depending on what is invalid
		}

		return Promise.resolve([]);
	}

	private validateId(id: string): boolean {
		return !(id.length < 1 || id.includes("_"));
	}
	private validateContent(content: CourseEntry[]): string {
        // TODO: Finish this up
		return "valid";
	}

	private async parseContent(content: string): Promise<CourseEntry[]> {
        /*
        Handles parsed content by propagating an InsightError up the chain.
         */
		await this.parseZip(content); // TODO: Does this need to return anything at all?
		return Promise.resolve([]);
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		// console.log("here");
		let isValid: boolean = false;
		let validate = new ValidateQuery(query as typeof Object);
		try {
			isValid = validate.validateQuery();


		} catch (e) {
			if (e === InsightError) {
				throw e;
			} else if (e === ResultTooLargeError) {
				throw e;
			} else {
				throw new InsightError(String(e instanceof Error));
			}
		}

		return {} as Promise<InsightResult[]>;
	}

	private async parseZip(content: string) {
		let zip = new JSZip();
		// zip.file(this.convertBase64ToArrayBuffer(content));
        // jszip load async function - use promises for processing
		console.log(zip);
        // TODO: This needs a bit more work
	}

	private convertBase64ToArrayBuffer(base_64_string: string): ArrayBuffer{
		let buffer = Buffer.from(base_64_string, "base64");
		console.log(buffer);
		return buffer;
	}

	private validateKind(kind: InsightDatasetKind): boolean {
		return kind !== InsightDatasetKind.Rooms;
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return Promise.resolve([]);
	}

	public removeDataset(id: string): Promise<string> {
		return Promise.resolve("");
	}

}

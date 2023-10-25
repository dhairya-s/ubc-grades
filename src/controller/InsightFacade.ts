import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "./IInsightFacade";
import JSZip from "jszip";
import ValidateQuery from "../services/validateQuery";
import * as fs from "fs";
import CollectQuery from "../services/collectQuery";
import * as fs_extra from "fs-extra";
import ValidateDataset from "./validateDataset";
import {DatasetEntry} from "./DatasetEntry";
import DatasetManager from "./DatasetManager";

export default class InsightFacade implements IInsightFacade {
	private datasetManager: DatasetManager = new DatasetManager();

	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		/*
			The promise should fulfill on a successful add, reject for any failures.
			The promise should fulfill with a string array,
			containing the ids of all currently added datasets upon a successful add.
			The promise should reject with an InsightError describing the error.

			An id is invalid if it contains an underscore, or is only whitespace characters.
			If id is the same as the id of an already added dataset, the dataset should be rejected and not saved.

			After receiving the dataset, it should be processed into a data structure of
			your design. The processed data structure should be persisted to disk; your
			system should be able to load this persisted value into memory for answering
			queries.

			Ultimately, a dataset must be added or loaded from disk before queries can
			be successfully answered.
		 */
		const validator = new ValidateDataset();
		let dataset: DatasetEntry | undefined;
		let datasetIds = await this.datasetManager.getDatasetIds();
		if (validator.validateId(id, datasetIds)) {
			let valid = await validator.validateContent(id, content, kind);
			if (valid) {
				dataset = validator.getValidDataset();
				if (dataset) {
					await this.datasetManager.saveDataset(dataset);
				}
				let result = await this.datasetManager.getDatasetIds();
				return Promise.resolve(result);
			} else {
				return Promise.reject(new InsightError("Invalid content."));
			}
		} else {
			return Promise.reject(new InsightError("Invalid id."));
		}
	}

	public async performQuery(query: unknown): Promise<InsightResult[]> {
		// await this.listDatasets();
		// let isValid: boolean = false;
		// let validate = new ValidateQuery(query as typeof Object);
		// let collect = new CollectQuery(query as typeof Object, this.datasets);
		// let results: InsightResult[] = [];
		// try {
		// 	isValid = validate.validateQuery();
		//
		// 	if (!isValid) {
		// 		throw new InsightError("Invalid Query");
		// 	}
		//
		// 	results = await collect.CollectQuery();
		// } catch (e) {
		// 	if (e instanceof InsightError) {
		// 		throw e;
		// 	} else if (e instanceof ResultTooLargeError) {
		// 		throw e;
		// 	} else {
		// 		throw new InsightError(String(e instanceof Error));
		// 	}
		// }
		//
		// return Promise.resolve(results);
		return Promise.reject("");
	}

	public async listDatasets(): Promise<InsightDataset[]> {
		return Promise.reject("");
	}

	public async removeDataset(id: string): Promise<string> {
		return Promise.reject("");
	}
}

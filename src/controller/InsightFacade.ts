import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "./IInsightFacade";
import ValidateQuery from "../services/validateQuery";
import CollectQuery from "../services/collectQuery";
import ValidateDataset from "../services/validateDataset";
import {DatasetEntry} from "../serviceHelpers/datasetConstruction/DatasetEntry";
import DatasetManager from "../services/DatasetManager";
import SectionsDatasetEntry from "../serviceHelpers/datasetConstruction/sectionsDataset/SectionsDatasetEntry";

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
		let datasets: DatasetEntry[] = await this.datasetManager.loadDatasetFromDisk();
		let isValid: boolean = false;
		let validate = new ValidateQuery(query as typeof Object);
		let collect = new CollectQuery(query as typeof Object, datasets);

		let results: InsightResult[] = [];
		try {

			let prelimDatasetId = validate.getPreliminaryDatasetId();
			let datasetKind: InsightDatasetKind | undefined;
			for (let dataset of datasets) {
				if (dataset.getId() === prelimDatasetId) {
					datasetKind = dataset.getKind();
				}
			}
			if (datasetKind !== undefined) {
				isValid = validate.ValidateQuery(datasetKind);
			} else {
				isValid = false;
			}
			if (validate.getDatasetId() !== validate.getPreliminaryDatasetId()) {
				isValid = false;
			}

			if (!isValid) {
				throw new InsightError("Invalid Query");
			}
			if (datasetKind !== undefined) {
				results = await collect.CollectQuery(validate.getDatasetId(), datasetKind);
			}
		} catch (e) {
			if (e instanceof InsightError) {
				throw e;
			} else if (e instanceof ResultTooLargeError) {
				throw e;
			} else {
				throw new InsightError(String(e instanceof Error));
			}
		}

		return Promise.resolve(results);
	}

	public async listDatasets(): Promise<InsightDataset[]> {
		const result = await this.datasetManager.readDatasetLedger();
		return Promise.resolve(result);
	}

	public async removeDataset(id: string): Promise<string> {
		try {
			let result = await this.datasetManager.removeDataset(id);
			return Promise.resolve(result);
		} catch {
			return Promise.reject(new NotFoundError("RemoveDataset failed."));
		}
	}
}

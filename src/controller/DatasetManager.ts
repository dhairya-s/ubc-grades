import {DatasetEntry} from "./DatasetEntry";
import {InsightDataset} from "./IInsightFacade";

export enum Operation {
	Add = "add",
	Remove = "remove"
}

export default class DatasetManager {

	constructor() {
		/*
		Load dataset ledger from disk.
		 */
		// TODO: Load dataset ledger from disk.
	}

	public async saveDataset(dataset: DatasetEntry) {
		/*
		Save dataset onto disk, and also into ledger.
		 */
		await this.addDatasetEntry(dataset);
		return Promise.resolve();
	}

	public async removeDataset(id: string) {
		/*
		Remove dataset from saved datasets
		 */
	}

	private async updateDatasetLedger(dataset: DatasetEntry, operation: Operation) {
		/*
		Updates the dataset ledger depending on the operation
		 */
	}

	private async addDatasetEntry(dataset: DatasetEntry) {

	}

	private async removeDatasetEntry(dataset: DatasetEntry) {

	}

	private async readDatasetLedger(): Promise<InsightDataset[]> {
		return Promise.reject("Could not get dataset ledger");
	}

	public async getDatasetIds(): Promise<string[]>{
		return Promise.resolve([]);
	}

	public async loadDatasetsFromDisk(): Promise<DatasetEntry[]> {
		return Promise.reject("Could not load datasets from disk.");
	}
}

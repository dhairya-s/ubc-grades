import {DatasetEntry} from "./DatasetEntry";
import {InsightDataset,InsightError} from "./IInsightFacade";
import fs from "fs-extra";


export enum Operation {
	Add = "add",
	Remove = "remove"
}

export default class DatasetManager {
	private path = "data/";
	private ledgerPath = this.path + "datasetLedger.json";

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
		await dataset.saveDataset(this.path);
		await this.addDatasetEntry(dataset);
		return Promise.resolve();
	}

	public async removeDataset(id: string) {
		/*
		Remove dataset from saved datasets.
		 */
		const datasetIds = await this.getDatasetIds();
		if (!datasetIds.includes(id)) {
			// try {
			//
			// } catch {
			//
			// }
		} else {
			return Promise.reject("Cannot remove nonexistent ID.");
		}
	}

	private async addDatasetEntry(dataset: DatasetEntry) {

		let datasets: any[] = [];

		try {
			const file = await fs.readJSON(this.ledgerPath);
			let ledgerJSON = JSON.parse(file);
			for (const ledgerEntry of ledgerJSON) {
				datasets.push(ledgerEntry);
			}
			datasets.push(dataset.createInsightDataset());
		} catch {
			datasets.push(dataset.createInsightDataset());
		}
		let content = JSON.stringify(datasets);
		try {
			await fs.writeJSON(this.ledgerPath, content, "utf-8");
		} catch(err) {
			return Promise.reject(new InsightError("Could not write to file."));
		}
		return Promise.resolve();
	}

	private async removeDatasetEntry(dataset: DatasetEntry) {

	}

	public async readDatasetLedger(): Promise<InsightDataset[]> {
		let datasets: any[] = [];
		if (fs.existsSync(this.ledgerPath)) {
			try {
				const fileContents = await fs.readJSON(this.ledgerPath);
				let ledgerJSON = JSON.parse(fileContents);
				for (const dataset of ledgerJSON) {
					datasets.push(dataset);
				}
				return Promise.resolve(datasets);
			} catch {
				return Promise.resolve([]);
			}
		} else {
			return Promise.resolve([]);
		}
	}

	public async getDatasetIds(): Promise<string[]>{

		let datasetIds: any[] = [];
		if (fs.existsSync(this.ledgerPath)) {
			try {
				const fileContents = await fs.readJSON(this.ledgerPath);
				let ledgerJSON = JSON.parse(fileContents);
				for (const dataset of ledgerJSON) {
					datasetIds.push(dataset["id"]);
				}
				return Promise.resolve(datasetIds);
			} catch {
				return Promise.resolve([]);
			}
		} else {
			return Promise.resolve([]);
		}
	}

	public async loadDatasetsFromDisk(): Promise<DatasetEntry[]> {
		return Promise.reject("Could not load datasets from disk.");
	}
}

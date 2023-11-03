import {DatasetEntry} from "../serviceHelpers/datasetConstruction/DatasetEntry";
import {InsightDataset, InsightError, NotFoundError} from "../controller/IInsightFacade";
import fs from "fs-extra";
import SectionsDatasetEntry from "../serviceHelpers/datasetConstruction/sectionsDataset/SectionsDatasetEntry";
import RoomsDatasetEntry from "../serviceHelpers/datasetConstruction/roomsDataset/RoomsDatasetEntry";


export enum Operation {
	Add = "add",
	Remove = "remove"
}

export default class DatasetManager {
	private path = "./data";
	private ledgerPath = this.path + "/datasetLedger.json";

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
		if (datasetIds.includes(id)) {
			await this.removeDatasetFromDisk(id);
			await this.removeDatasetFromLedger(id);
			return Promise.resolve(id);
		} else {
			return Promise.reject(new NotFoundError("Cannot remove nonexistent ID."));
		}
	}

	private async removeDatasetFromLedger(id: string) {
		/*
		Removes dataset from on ledger storage.
		 */
		let datasets = await this.readDatasetLedger();
		datasets = datasets.filter(function (dataset: any): boolean {
			return dataset.id !== id;
		});
		await this.saveDatasetLedger(datasets);
		return Promise.resolve();
	}

	private async saveDatasetLedger(datasets: any[]) {
		let content = JSON.stringify(datasets);
		try {
			await fs.writeJSON(this.ledgerPath, content, "utf-8");
			return Promise.resolve();
		} catch(err) {
			return Promise.reject(new InsightError("Could not write to file."));
		}
	}

	private async removeDatasetFromDisk(id: string) {
		/*
		Removes dataset from on disk storage.
		 */
		try {
			let dirFiles = fs.readdirSync(this.path);
			let removeDir = dirFiles.filter(function(value) {
				return value.includes(id);
			})[0];
			fs.removeSync(this.path + "/" + removeDir);
			return Promise.resolve();
		} catch {
			return Promise.reject(new NotFoundError("File in disk not found."));
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
		await this.saveDatasetLedger(datasets);
		return Promise.resolve();
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

	public async loadSectionsDatasetsFromDisk(): Promise<DatasetEntry[]> {
		// return Promise.reject("Could not load datasets from disk.");
		try {
			let dirFiles = fs.readdirSync(this.path);
			dirFiles = dirFiles.filter(function(value) {
				return value !== "datasetLedger.json";
			});

			let loadedDatasetPromises: Array<Promise<DatasetEntry>> = [];

			for (const dir of dirFiles) {
				const dataset = this.loadDataset(dir);
				loadedDatasetPromises.push(dataset);
			}

			let datasetEntries = await Promise.all(loadedDatasetPromises);
			return Promise.resolve(datasetEntries);

		} catch {
			return Promise.reject(new InsightError("Could not load datasets."));
		}
	}

	public async loadDataset(datasetDir: string): Promise<DatasetEntry> {
		// let dataset = new SectionsDatasetEntry();
		const fileContents = await fs.readJSON(this.path + "/" + datasetDir);
		let objectJSON = JSON.parse(fileContents);
		let dataset = new DatasetEntry();
		dataset.JSONToDatasetEntry(objectJSON);
		return Promise.resolve(dataset);
	}

	// public async loadRoomsDatasetsFromDisk(): Promise<RoomsDatasetEntry[]> {
	// 	// return Promise.reject("Could not load datasets from disk.");
	// 	try {
	// 		let dirFiles = fs.readdirSync(this.path);
	// 		dirFiles = dirFiles.filter(function(value) {
	// 			return value !== "datasetLedger.json";
	// 		});
	//
	// 		let loadedDatasetPromises: Array<Promise<RoomsDatasetEntry>> = [];
	//
	// 		for (const dir of dirFiles) {
	// 			const dataset = this.loadRoomsDataset(dir);
	// 			loadedDatasetPromises.push(dataset);
	// 		}
	//
	// 		let datasetEntries = await Promise.all(loadedDatasetPromises);
	// 		return Promise.resolve(datasetEntries);
	//
	// 	} catch {
	// 		return Promise.reject(new InsightError("Could not load datasets."));
	// 	}
	// }
	//
	// public async loadRoomsDataset(datasetDir: string): Promise<RoomsDatasetEntry> {
	// 	// let dataset = new SectionsDatasetEntry();
	// 	const fileContents = await fs.readJSON(this.path + "/" + datasetDir);
	// 	let objectJSON = JSON.parse(fileContents);
	// 	let dataset = new RoomsDatasetEntry();
	// 	dataset.JSONToDatasetEntry(objectJSON);
	// 	return Promise.resolve(dataset);
	// }
}

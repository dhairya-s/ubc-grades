import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "./IInsightFacade";
import DatasetEntry from "../../src/controller/DatasetEntry";
import JSZip from "jszip";
import ValidateQuery from "../services/validateQuery";
import * as fs from "fs";
import CollectQuery from "../services/collectQuery";
import * as fs_extra from "fs-extra";

export default class InsightFacade implements IInsightFacade {
	private datasets: DatasetEntry[] = [];
	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		// Need to load datasets that have previously been in the system
		await this.listDatasets(); // in case there is a crash
		if (!this.validateIdAdd(id)) {
			return Promise.reject(new InsightError("Invalid ID was given to addDataset. " +
                "Try an ID without an underscore or non duplicate id."));

		} else if (!this.validateKind(kind)) {
			return Promise.reject(
				new InsightError("addDataset was given a 'rooms' kind when it only accepts " + "'sections'.")
			);
		}
		try {
			let parsedContent = await this.parseContent(content, id, kind);
			parsedContent.get_numRows();
			await parsedContent.save_dataset();
			this.datasets.push(parsedContent);
			let names = this.get_dataset_names();
			return Promise.resolve(names);
		} catch {
			return Promise.reject(new InsightError("Invalid content was provided."));
		}
	}

	private duplicate_id_check(id: string): boolean {
		// Returns true if this is duplicated
		let existingIds = this.get_dataset_names();
		return existingIds.includes(id);
	}
	private get_dataset_names(): string[] {
		return this.datasets.map(function (dataset) {
			return dataset.get_id();
		});
	}
	private validateIdAdd(id: string): boolean {
		return !(id.trim().length < 1 || id.includes("_")) && !this.duplicate_id_check(id);
	}

	private async parseContent(content: string, id: string, kind: InsightDatasetKind): Promise<Awaited<DatasetEntry>> {
		/*
		Parses content into a readable Dataset object.
		 */
		try {
			let entry = await this.parseZip(content, id, kind); // TODO: Does this need to return anything at all?
			return Promise.resolve(entry);
		} catch {
			return Promise.reject(new InsightError("Content could not be parsed"));
		}
	}

	public async performQuery(query: unknown): Promise<InsightResult[]> {
		await this.listDatasets();
		let isValid: boolean = false;
		let validate = new ValidateQuery(query as typeof Object);
		let collect = new CollectQuery(query as typeof Object, this.datasets);
		let results: InsightResult[] = [];
		try {
			isValid = validate.validateQuery();

			if (!isValid) {
				throw new InsightError("Invalid Query");
			}
			results = await collect.CollectQuery();
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

	private async parseZip(content: string, id: string, kind: InsightDatasetKind): Promise<DatasetEntry> {
		let zip = new JSZip();
		let path = "src/saved_data/";
		let entry = new DatasetEntry(id, kind);
		await zip.loadAsync(content, {base64: true}).then(async function (unzipped_contents) {
			try {
				await entry.parse_dataset_entry(zip, unzipped_contents);
				// console.log(entry);
				return entry;
			} catch {
				throw new InsightError("Unable to parse course");
			}
		});
		return entry;
	}

	private validateKind(kind: InsightDatasetKind): boolean {
		return kind !== InsightDatasetKind.Rooms;
	}
	public async listDatasets(): Promise<InsightDataset[]> {
		this.datasets = [];
		// Load datasets from folder
		// List key properties
		let dir = "src/saved_data/";
		try {
			let dirFiles = fs.readdirSync(dir);
			dirFiles = dirFiles.filter(function (value) {
				return value !== ".gitkeep";
			});
			let loadedDatasetPromises: Array<Promise<DatasetEntry>> = [];
			let datasetIds = dirFiles.map((x) => x.substring(0, x.length - 4));

			for (const i in datasetIds) {
				let newContent = new DatasetEntry(datasetIds[i], InsightDatasetKind.Sections);
				let result = newContent.load_dataset(dir + dirFiles[i]);
				loadedDatasetPromises.push(result);
			}
			let datasetEntries = await Promise.all(loadedDatasetPromises);
			this.datasets = datasetEntries;

			let loadedDatasets: InsightDataset[] = [];
			for (const dataset of datasetEntries) {
				loadedDatasets.push(dataset.dataset_entry_to_insight_dataset());
			}
			return Promise.resolve(loadedDatasets);
		} catch {
			return Promise.reject(new InsightError("Could not load datasets."));
		}
	}

	private validateIdRemove(id: string): boolean {
		return !(id.trim().length < 1 || id.includes("_"));
	}
	public async removeDataset(id: string): Promise<string> {
		await this.listDatasets(); // in case there is a crash
		if (!this.validateIdRemove(id)) {
			return Promise.reject(new InsightError("Invalid ID was given to addDataset. " +
				"Try an ID without an underscore or not all whitespace."));
		}

		let datasetNames = this.get_dataset_names();
		if (!datasetNames.includes(id)) {
			return Promise.reject(new NotFoundError("Dataset not found"));
		}
		try {
			this.datasets = this.datasets.filter(function (dataset) {
				return dataset.get_id() !== id;
			});
			let fileDir = "src/saved_data/" + id + ".json";
			fs_extra.removeSync(fileDir);
		} catch {
			return Promise.reject(new InsightError("Unable to remove dataset."));
		}

		return Promise.resolve(id);
		// return Promise.reject(new InsightError("Could not remove dataset"));
	}
}

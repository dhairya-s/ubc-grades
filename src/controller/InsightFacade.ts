import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	ResultTooLargeError,
} from "./IInsightFacade";
import {isBooleanObject} from "util/types";
import CourseEntry from "./CourseEntry";
import base = Mocha.reporters.base;
import DatasetEntry from "./DatasetEntry";
import JSZip from "jszip";
import ValidateQuery from "../services/validateQuery";
import * as fs from "fs";
import CollectQuery from "../services/collectQuery";

export default class InsightFacade implements IInsightFacade {
	private datasets: DatasetEntry[] = [];
	public async addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		if (!this.validateId(id)) {
			return Promise.reject(
				new InsightError("Invalid ID was given to addDataset. " + "Try an ID without an underscore.")
			);
		} else if (!this.validateKind(kind)) {
			return Promise.reject(
				new InsightError("addDataset was given a 'rooms' kind when it only accepts " + "'sections'.")
			);
		}
		try {
			let parsedContent = await this.parseContent(content, id, kind);
			parsedContent.get_numRows();
			this.datasets.push(parsedContent);
			let names = this.get_dataset_names();
			return Promise.resolve(names);
		} catch {
			return Promise.reject(new InsightError("Invalid content was provided."));
		}
	}

	private get_dataset_names(): string[] {
		return this.datasets.map(function (dataset) {
			return dataset.get_id();
		});
	}
	private validateId(id: string): boolean {
		return !(id.length < 1 || id.includes("_"));
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
			if (e === InsightError) {
				throw e;
			} else if (e === ResultTooLargeError) {
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
				return new InsightError("Unable to parse course");
			}
		});
		return entry;
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

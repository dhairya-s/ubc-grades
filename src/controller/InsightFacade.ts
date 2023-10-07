import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, InsightResult} from "./IInsightFacade";
import {isBooleanObject} from "util/types";
import CourseEntry from "./CourseEntry";
import base = Mocha.reporters.base;
import DatasetEntry from "./DatasetEntry";
import JSZip from "jszip";
import * as fs from "fs";

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
		try {
			let parsedContent = await this.parseContent(content, id);
			parsedContent.get_numRows();
			return Promise.resolve([]);
		} catch {
			return Promise.reject(new InsightError("Invalid content was provided."));
		}
	}

	private validateId(id: string): boolean {
		return !(id.length < 1 || id.includes("_"));
	}

	private async parseContent(content: string, id: string): Promise<Awaited<DatasetEntry>> {
		/*
		Parses content into a readable Dataset object.
		 */
		try {
			let entry = await this.parseZip(content, id); // TODO: Does this need to return anything at all?
			return Promise.resolve(entry);
		} catch {
			return Promise.reject(new InsightError("Content could not be parsed"));
		}
	}

	private async parseZip(content: string, id: string): Promise<DatasetEntry> {
		let zip = new JSZip();
		let path = "src/saved_data/";
		let entry = new DatasetEntry(id);
		await zip.loadAsync(content, {base64: true}).then(async function (unzipped_contents) {
			try {
				await entry.parse_dataset_entry(zip, unzipped_contents);
				console.log(entry);
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
        // return Promise.resolve(
        // // [{
        // //                     id:"dataset1",
        // //                     kind: InsightDatasetKind.Sections,
        // //                     numRows: 5298
        // //                 }]
        // // )
        //     [
        //
        //         {
        //             id:"dataset2",
        //             kind: InsightDatasetKind.Sections,
        //             numRows: 1
        //         } ,
        //         {
        //             id:"dataset1",
        //             kind: InsightDatasetKind.Sections,
        //             numRows: 5298
        //         }])
		return Promise.resolve([]);
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return Promise.resolve([]);
        // return Promise.reject(new InsightError)
	}

	public removeDataset(id: string): Promise<string> {
        // return Promise.resolve("id string");
        // return Promise.reject(new NotFoundError())
        // return Promise.reject(new InsightError("insightError"))
		return Promise.resolve("");
	}

}

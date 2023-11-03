import {InsightDataset, InsightDatasetKind, InsightError} from "../../controller/IInsightFacade";
import fs from "fs-extra";
import SectionsDatasetEntry from "./sectionsDataset/SectionsDatasetEntry";
import RoomsDatasetEntry from "./roomsDataset/RoomsDatasetEntry";
import CourseEntry from "./sectionsDataset/CourseEntry";
import BuildingEntry from "./roomsDataset/BuildingEntry";
import RoomEntry from "./roomsDataset/RoomEntry";
import SectionEntry from "./sectionsDataset/SectionEntry";
import QueryObject from "./QueryObject";

export class DatasetEntry {
	public id: string = "";
	public numRows: number = 0;
	public kind: InsightDatasetKind = InsightDatasetKind.Rooms;
	public children: CourseEntry[] | BuildingEntry[] = [];
	/*
	Must validate DatasetEntry according to spec.
	 */
	public validateDatasetEntry(): boolean{
		return false;
	}

	/*
	Create datasetEntry.
	 */
	public createDatasetEntry(id: string, content: string, kind: InsightDatasetKind): void {
		return;
	}

	public async saveDataset(path: string): Promise<void> {
		let saveDir = path + "/" + this.getId() + ".json";
		let content = JSON.stringify(this);
		try {
			if (!fs.existsSync(path + "/")){
				fs.mkdirSync(path + "/");
			}
			await fs.writeJSON(saveDir, content, "utf-8");
		} catch(err) {
			return Promise.reject(new InsightError("Could not write new dataset to file."));
		}
		return Promise.resolve();
	}

	public createInsightDataset(): InsightDataset {
		return {
			id: this.getId(),
			kind: this.getKind(),
			numRows: this.getNumRows(),
		};
	}

	public getId(): string {
		return this.id;
	}

	public getNumRows(): number {
		return this.numRows;
	}

	public getKind(): InsightDatasetKind {
		return this.kind;
	}

	public setNumRows(num_rows: number){
		this.numRows = num_rows;
	}

	public setId(id: string) {
		this.id = id;
	}

	public setKind(kind: InsightDatasetKind) {
		this.kind = kind;
	}

	public JSONToDatasetEntry(objectJSON: any) {

	}

	public getChildren() {
		return this.children;
	}

	public setChildren(sections: BuildingEntry[] | CourseEntry[]) {
		this.children = sections;
	}

	public getQueryObjects(): QueryObject[] {
		let queryObjects: any[] = [];
		for (const child of this.getChildren()){
			queryObjects.concat(child.getChildren());
		}
		return queryObjects;
	}
}

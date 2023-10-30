import {DatasetEntry} from "./DatasetEntry";
import {InsightDataset, InsightDatasetKind} from "./IInsightFacade";
import CourseEntry from "./CourseEntry";
import BuildingEntry from "./BuildingEntry";

export default class RoomsDatasetEntry implements DatasetEntry {
	public id: string = "";
	public numRows: number = 0;
	public kind: InsightDatasetKind = InsightDatasetKind.Rooms;
	public buildings: BuildingEntry[] = [];

	public createDatasetEntry(id: string, content: string, kind: InsightDatasetKind): void {
		console.log("Created dataset entry");
	}

	public createInsightDataset(): InsightDataset {
		return {
			id: this.get_id(),
			kind: this.get_kind(),
			numRows: this.get_numRows(),
		};
	}


	public get_id(): string {
		return "";
	}

	public saveDataset(path: string): void {
		console.log("Dataset saved");
	}

	public validateDatasetEntry(): boolean {
		return false;
	}

	private get_kind() {
		return InsightDatasetKind.Rooms;
	}

	private get_numRows() {
		return 0;
	}

	public getBuildings() {
		return this.buildings;
	}
}

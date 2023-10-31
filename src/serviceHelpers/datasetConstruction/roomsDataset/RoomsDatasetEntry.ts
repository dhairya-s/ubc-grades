import {DatasetEntry} from "../DatasetEntry";
import {InsightDataset, InsightDatasetKind, InsightError} from "../../../controller/IInsightFacade";
import BuildingEntry from "./BuildingEntry";
import JSZip from "jszip";
import {unzip} from "zlib";

export default class RoomsDatasetEntry implements DatasetEntry {
	public id: string = "";
	public numRows: number = 0;
	public kind: InsightDatasetKind = InsightDatasetKind.Rooms;
	public buildings: BuildingEntry[] = [];

	public async createDatasetEntry(id: string, content: string, kind: InsightDatasetKind): Promise<RoomsDatasetEntry> {
		/*
		Creates a RoomsDatasetEntry using the content given.

		If creating is impossible, then it throws an error.

		Steps:
		1. Decode the zip file, populate entries in dataset.
		 */
		try {
			this.setId(id);
			this.setKind(kind);
			let buildings = await this.parseZip(content);
			this.setBuildings(buildings);
		} catch {
			return Promise.reject("Could not parse zip file.");
		}
		return Promise.resolve(this);
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
		/*
		Content is an entire zip file. Should use JSZip file to unzip, navigate through,
		view files inside.

		A valid dataset:
		- Is a zip file
		- Contains at least one valid room
		- Has a valid index.htm file (if index.htm exists, then safe to assume that it
			will always be a well-formatted HTML file.

		If this is a valid DatasetEntry:
		- Populate rest of fields
		- Save to disk

		RETURNS:
		- True if the sections dataset is valid
		- False otherwise
		 */
		return false;
	}

	public async findValidTable(indexDir: string): Promise<boolean>{
		/*
		Finds the valid building list table.
		- If index.htm does NOT contain a valid table, then index.htm is invalid.

		- Each row in the table represents a building and the row will contain a column
		that links to the building's data file within the zip file.
		- The building file may not exist, or it could contain no valid rooms.

		-
		 */

		return Promise.resolve(false);
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

	public setBuildings(buildings: BuildingEntry[]) {
		this.buildings = buildings;
	}

	private setId(id: string) {
		this.id = id;
	}

	private setKind(kind: InsightDatasetKind) {
		this.kind = kind;
	}

	private async parseZip(content: string): Promise<BuildingEntry[]> {
		// TODO: C2
		/*
		Parses zip file using JSZip.

		Turns Zip file into a SectionsDatasetEntry if possible.
		- If not possible, then throws an InsightError.
		- If not valid zip file, throws InsightError
		- If can't find index.htm file, throws InsightError.

		Attempts to validate the index.htm file.
		 */
		let zip = new JSZip();
		let buildings: BuildingEntry[] = [];
		await zip.loadAsync(content, {base64: true}).then(async (unzipped_contents) => {
			try {
				let filenames = Object.keys(unzipped_contents.files);
				let filenameBuildingContent: boolean[] = [];

				let index = await this.findAndParseIndex(unzipped_contents, filenames);

			} catch {
				throw new InsightError("Unable to parse dataset entry.");
			}
		});
		return Promise.resolve([]);
	}

	private async findAndParseIndex(unzipped_contents: JSZip, filenames: string[]): Promise<string> {

		return Promise.resolve("");
	}
}

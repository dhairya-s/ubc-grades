import {DatasetEntry} from "../DatasetEntry";
import {InsightDataset, InsightDatasetKind, InsightError} from "../../../controller/IInsightFacade";
import BuildingEntry from "./BuildingEntry";
import JSZip from "jszip";
import {parse} from "parse5";

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
			id: this.getId(),
			kind: this.getKind(),
			numRows: this.getNumRows(),
		};
	}


	public getId(): string {
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

	public getKind() {
		return InsightDatasetKind.Rooms;
	}

	public getNumRows() {
		return 0;
	}

	public getBuildings() {
		return this.buildings;
	}

	public setBuildings(buildings: BuildingEntry[]) {
		this.buildings = buildings;
	}

	public addBuilding(building: BuildingEntry) {
		this.buildings.push(building);
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
				console.log(filenames);
				let filenameBuildingContent: boolean[] = [];
				let index = await this.findAndParseIndex(zip, unzipped_contents, filenames);
			} catch {
				throw new InsightError("Unable to parse dataset entry.");
			}
		});
		return Promise.resolve([]);
	}

	private async findAndParseIndex(zip: JSZip, unzipped_contents: JSZip, filenames: string[]): Promise<string> {
		try {
			let index = "";
			let indexFilenameContained = true;
			for (const filename of filenames) {
				if (filename === "index.htm") {
					indexFilenameContained = true;
				}
			}
			if (indexFilenameContained){
				let file = zip.file("index.htm");
				await this.parseIndex(file, "index.htm");
				await this.validateBuildings(zip, unzipped_contents);
			}
		} catch {
			return Promise.reject(new InsightError());
		}
		return Promise.resolve("Could not find index.htm");
	}

	private async parseIndex(file: JSZip.JSZipObject | null, filename: string): Promise<void> {
		/*
		Parses index file and returns table.
		 */
		if (file != null) {
			await file.async("text").then((body: any) => {
				try {
					// console.log(body)
					const document = parse(body);
					this.findTable(document);
					// console.log(this.getBuildings());
				} catch {
					return Promise.reject(new InsightError("Could not parse index.htm."));
				}
			});
		}

		return Promise.resolve();
	}

	private async validateBuildings(zip: JSZip, unzipped_contents: JSZip) {
		let filledBuildings: Array<Promise<BuildingEntry>> = [];
		for (const building of this.getBuildings()) {
			let result = building.generateRoomInformation(zip, unzipped_contents);
			filledBuildings.push(result);
		}
		this.setBuildings(await Promise.all(filledBuildings));
		let buildings = this.getBuildings().filter(function(building) {
			return building.validateBuildingEntry();
		});

		this.setBuildings(buildings);
	}

	private findTable(document: any): any {

		if (document.childNodes) {
			for (const node of document.childNodes) {
				if (node.nodeName.includes("table")) {
					if (node.attrs){
						for (const attr of node.attrs) {
							if (attr.name && attr.value) {
								if(attr.name.includes("class") && (attr.value.includes("views-table"))) {
									this.parseTable(node);
								}
							}
						}
					}
				}
				this.findTable(node);
			}
		}
	}

	private parseTable(node: any): any {
		if (node.childNodes) {
			for (const tableNode of node.childNodes) {
				if (tableNode.nodeName.includes("tbody")) {
					this.parseTableRows(tableNode);
				}
			}
		}
	}

	private parseTableRows(node: any): any {
		if (node.childNodes) {
			for (const tableNode of node.childNodes) {
				if (tableNode.nodeName.includes("tr")) {
					this.validateTableRow(tableNode);
				}
			}
		}
	}

	private validateTableRow(row: any): any {
		let buildingEntry = new BuildingEntry();
		for (const node of row.childNodes) {
			if (node.nodeName.includes("td")) {
				if (node.attrs) {
					for (const attr of node.attrs) {
						if (attr.name && attr.value) {
							if (attr.name.includes("class") &&
								(attr.value.includes("views-field-field-building-code"))) {
								let code = this.getBuildingCodeFromHTML(node);
								buildingEntry.setBuildingCode(code);
							} else{
								buildingEntry.setValid(false);
							}
							if (attr.name.includes("class") && (attr.value.includes("views-field-title"))) {
								let link = this.getBuildingLinkFromHTML(node);
								let name = this.getBuildingNameFromHTML(node);
								buildingEntry.setLink(link);
								buildingEntry.setBuildingName(name);
							} else{
								buildingEntry.setValid(false);
							}
							if (attr.name.includes("class") &&
								(attr.value.includes("views-field-field-building-address"))) {
								let address = this.getBuildingAddressFromHTML(node);
								buildingEntry.setAddress(address);
							} else{
								buildingEntry.setValid(false);
							}
						}
					}
				}
			}
		}
		this.addBuilding(buildingEntry);
	}

	private getBuildingCodeFromHTML(node: any): string {
		let text = node.childNodes[0].value;
		text = text.trim();
		return text;
	}

	private getBuildingLinkFromHTML(node: any): string {
		let text = node.childNodes[1].attrs[0].value;
		return text;
	}

	private getBuildingNameFromHTML(node: any): string {
		let text = node.childNodes[1].childNodes[0].value;
		text = text.trim();
		return text;
	}

	private getBuildingAddressFromHTML(node: any): string {
		let text = node.childNodes[0].value;
		text = text.trim();
		return text;
	}
}

import BuildingEntry from "./BuildingEntry";
import JSZip from "jszip";
import {InsightError} from "../../../controller/IInsightFacade";
import {parse} from "parse5";

export default class ParseRoomsHTML {

	public buildings: BuildingEntry[] = [];

	public getBuildings() {
		return this.buildings;
	}

	public setBuildings(buildings: BuildingEntry[]) {
		this.buildings = buildings;
	}

	public addBuilding(building: BuildingEntry) {
		this.buildings.push(building);
	}

	public async parseZip(content: string): Promise<BuildingEntry[]> {
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
				let index = await this.findAndParseIndex(zip, unzipped_contents, filenames);
			} catch {
				throw await Promise.reject(new InsightError("Unable to parse dataset entry."));
			}
		});
		return Promise.resolve(this.getBuildings());
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
				let awaitedBuildings = await this.validateBuildings(zip, unzipped_contents);
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
					const document = parse(body);
					this.findTable(document);
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
		let awaitedBuildings = await Promise.all(filledBuildings);
		this.setBuildings(awaitedBuildings);
		let filteredBuildings = this.getBuildings().filter(function(building) {
			return building.validateBuildingEntry();
		});

		this.setBuildings(filteredBuildings);

		return Promise.resolve(filteredBuildings);
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
							}
							if (attr.name.includes("class") && (attr.value.includes("views-field-title"))) {
								let link = this.getBuildingLinkFromHTML(node);
								let name = this.getBuildingNameFromHTML(node);
								buildingEntry.setLink(link);
								buildingEntry.setBuildingName(name);
							}
							if (attr.name.includes("class") &&
								(attr.value.includes("views-field-field-building-address"))) {
								let address = this.getBuildingAddressFromHTML(node);
								buildingEntry.setAddress(address);
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

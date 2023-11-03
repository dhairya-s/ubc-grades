import RoomEntry from "./RoomEntry";
import JSZip from "jszip";
import RoomsDatasetEntry from "./RoomsDatasetEntry";
import {InsightError} from "../../../controller/IInsightFacade";
import {parse} from "parse5";

export default class BuildingEntry {

	public children: RoomEntry[] = [];
	public buildingName: string = "";
	public link: string = "";
	public address: string = "";
	public buildingCode: string = "";
	public valid: boolean = true;

	public setChild(rooms: RoomEntry[]) {
		this.children = rooms;
	}

	public addChild(room: RoomEntry) {
		this.children.push(room);
	}

	public setBuildingName(name: string) {
		this.buildingName = name;
	}

	public setLink(link: string) {
		this.link = link;
	}

	public setAddress(address: string) {
		this.address = address;
	}

	public setBuildingCode(code: string) {
		this.buildingCode = code;
	}

	public setValid(valid: boolean) {
		this.valid = valid;
	}

	public getChildren() {
		return this.children;
	}

	public getBuildingName() {
		return this.buildingName;
	}

	public getLink() {
		return this.link;
	}

	public getAddress() {
		return this.address;
	}

	public getBuildingCode() {
		return this.buildingCode;
	}

	public getValid() {
		return this.valid;
	}


	public async generateRoomInformation(zip: JSZip, unzipped_contents: JSZip): Promise<BuildingEntry> {
		try {
			let file = zip.file(this.getLink().slice(2));
			if (file != null) {
				await this.parseBuildingFile(file);
			}
			let roomPromises: Array<Promise<void>> = [];
			for (const room of this.getChildren()) {
				roomPromises.push(room.setLocation());
			}
			await Promise.all(roomPromises);
		} catch {
			this.setValid(false);
			return Promise.resolve(this);
		}
		return Promise.resolve(this);
	}

	public async parseBuildingFile(file: JSZip.JSZipObject): Promise<void> {
		await file.async("text").then((body: any) => {
			try {
				let html = body;
				const document = parse(body);
				this.findTable(document);
			} catch {
				throw new InsightError("Building file could not be parsed.");
			}
		});


		return Promise.resolve();
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
		let roomEntry = new RoomEntry();
		for (const node of row.childNodes) {
			if (node.nodeName.includes("td")) {
				if (node.attrs) {
					for (const attr of node.attrs) {
						if (attr.name && attr.value) {
							if (attr.name.includes("class") &&
								(attr.value.includes("views-field-field-room-number"))) {
								let number = this.getRoomNumberFromHTML(node);
								let href = this.getHrefFromHTML(node);
								roomEntry.setNumber(number);
								roomEntry.setHref(href);
							}
							if (attr.name.includes("class") &&
								(attr.value.includes("views-field-field-room-capacity"))) {
								let capacity = this.getCapacityFromHTML(node);
								roomEntry.setSeats(capacity);
							}
							if (attr.name.includes("class") &&
								(attr.value.includes("views-field-field-room-furniture"))) {
								let furniture = this.getFurnitureFromHTML(node);
								roomEntry.setFurniture(furniture);
							}
							if (attr.name.includes("class") &&
								(attr.value.includes("views-field-field-room-type"))) {
								let type = this.getTypeFromHTML(node);
								roomEntry.setType(type);
							}

							roomEntry.setFullname(this.getBuildingName());
							roomEntry.setShortname(this.getBuildingCode());
							roomEntry.setName(roomEntry.getShortname() + "_" + roomEntry.getNumber());
							roomEntry.setAddress(this.getAddress());
						}
					}
				}
			}
		}
		this.addChild(roomEntry);
	}

	private getRoomNumberFromHTML(node: any): string {
		let result = node.childNodes[1].childNodes[0].value;
		result = result.trim();
		return result;
	}

	private getHrefFromHTML(node: any): string {
		let result = node.childNodes[1].attrs[0].value;
		result = result.trim();
		return result;
	}

	private getCapacityFromHTML(node: any): number {
		let result = node.childNodes[0].value;
		result = result.trim();
		return parseInt(result, 10);
	}

	private getFurnitureFromHTML(node: any): string {
		let result = node.childNodes[0].value;
		result = result.trim();
		return result;
	}

	private getTypeFromHTML(node: any): string {
		let result = node.childNodes[0].value;
		result = result.trim();
		return result;
	}

	public validateBuildingEntry() {
		let filtered = this.getChildren().filter(function(room) {
			return room.getValid();
		});
		return filtered.length > 0;
	}

	public JSONToEntry(json: any): BuildingEntry {
		this.setBuildingName(json["buildingName"]);

		let rooms = json["children"];
		let roomEntries = [];
		for (const room of rooms) {
			const roomEntry = new RoomEntry();
			roomEntry.queryObjectFromDisk(room);
			roomEntries.push(roomEntry);
		}

		this.setChild(roomEntries);

		return this;
	}
}

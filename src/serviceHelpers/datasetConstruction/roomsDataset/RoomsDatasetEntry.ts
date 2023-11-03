import {DatasetEntry} from "../DatasetEntry";
import {InsightDataset, InsightDatasetKind, InsightError} from "../../../controller/IInsightFacade";
import BuildingEntry from "./BuildingEntry";
import JSZip from "jszip";
import {parse} from "parse5";
import ParseRoomsHTML from "./ParseHTML";
import fs from "fs-extra";
import CourseEntry from "../sectionsDataset/CourseEntry";

export default class RoomsDatasetEntry extends DatasetEntry {
	public id: string = "";
	public numRows: number = 0;
	public kind: InsightDatasetKind = InsightDatasetKind.Rooms;
	public children: BuildingEntry[] = [];

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
			let parser = new ParseRoomsHTML();
			let buildings = await parser.parseZip(content);
			this.setChildren(buildings);
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
		return this.id;
	}

	public JSONToDatasetEntry(json: any): RoomsDatasetEntry {
		/*
		Returns a SectionsDatasetEntry from the JSON.
		 */
		this.setId(json["id"]);
		this.setNumRows(json["numRows"]);
		this.setKind(json["kind"]);

		let buildings = json["children"];
		let buildingEntries: BuildingEntry[] = [];
		for (const building of buildings){
			const buildingEntry = new BuildingEntry();
			buildingEntry.JSONToEntry(building);
			buildingEntries.push(buildingEntry);
		}

		this.setChildren(buildingEntries);

		return this;
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
		let filtered = this.getChildren().filter(function(building) {
			return building.validateBuildingEntry();
		});
		return filtered.length > 0;
	}

	public getNumRows() {
		let numRooms = this.getChildren().map(function(building) {
			return building.getChildren().length;
		}).reduce((sum, current) => sum + current, 0);
		this.setNumRows(numRooms);

		return this.numRows;
	}

	public getChildren() {
		return this.children;
	}

	public setChildren(buildings: BuildingEntry[]) {
		this.children = buildings;
	}
}

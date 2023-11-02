import RoomEntry from "./RoomEntry";

export default class BuildingEntry {

	public rooms: RoomEntry[] = [];
	public buildingName: string = "";
	public link: string = "";
	public address: string = "";
	public buildingCode: string = "";

	public setRooms(rooms: RoomEntry[]) {
		this.rooms = rooms;
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

	public getRooms() {
		return this.rooms;
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

	public generateRoomInformation() {
		return;
	}

	public validateBuildingEntry() {
		return true;
	}
}

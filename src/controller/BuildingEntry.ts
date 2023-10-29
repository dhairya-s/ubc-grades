import RoomEntry from "./RoomEntry";

export default class BuildingEntry {

	public rooms: RoomEntry[] = [];
	public buildingName: string = "";

	public getRooms() {
		return this.rooms;
	}

	public setRooms(rooms: RoomEntry[]) {
		this.rooms = rooms;
	}

	public getBuildingName() {
		return this.buildingName;
	}

	public setBuildingName(name: string) {
		this.buildingName = name;
	}
}

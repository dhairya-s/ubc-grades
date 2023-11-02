import * as http from "http";

interface GeoResponse {

	lat?: number;

	lon?: number;

	error?: string;

}
export default class RoomEntry {
	private location: GeoResponse = {};
	private fullname: string = "";
	private shortname: string = "";
	private number: string = "";
	private name: string = "";
	private address: string = "";
	private lat: number = 0;
	private lon: number = 0;
	private seats: number = 0;
	private type: string = "";
	private furniture: string = "";
	private href: string = "";
	private valid: boolean = false;

	public getLocation() {
		return this.location;
	}

	public getFullname() {
		return this.fullname;
	}

	public getShortname() {
		return this.shortname;
	}

	public getNumber() {
		return this.number;
	}

	public getName() {
		return this.name;
	}

	public getAddress() {
		return this.address;
	}

	public getLat() {
		return this.lat;
	}

	public getLon() {
		return this.lon;
	}

	public getSeats() {
		return this.seats;
	}

	public getType() {
		return this.type;
	}

	public getFurniture() {
		return this.furniture;
	}

	public getHref() {
		return this.href;
	}

	public getValid() {
		return this.valid;
	}

	public setLocation() {
		return;
	}

	public setFullname(fullname: string) {
		this.fullname = fullname;
	}

	public setShortname(shortname: string) {
		this.shortname = shortname;
	}

	public setNumber(number: string) {
		this.number = number;
	}

	public setName(name: string) {
		this.name = name;
	}

	public setAddress(address: string) {
		this.address = address;
	}

	public setLat(lat: number) {
		this.lat = lat;
	}

	public setLon(lon: number) {
		this.lon = lon;
	}

	public setSeats(seats: number) {
		this.seats = seats;
	}

	public setType(type: string) {
		this.type = type;
	}

	public setFurniture(furniture: string) {
		this.furniture = furniture;
	}

	public setHref(href: string) {
		this.href = href;
	}

	public setValid(valid: boolean) {
		this.valid = valid;
	}
}

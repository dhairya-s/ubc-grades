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
}

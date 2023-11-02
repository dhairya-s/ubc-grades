import * as http from "http";
import {InsightError} from "../../../controller/IInsightFacade";

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
	private valid: boolean = true;

	private counter = {
		number: false,
		href: false,
		capacity: false,
		furniture: false,
		location: false,
		type: false
	};

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
		const values = Object.values(this.counter);
		return !values.includes(false);
	}

	public async setLocation(): Promise<void> {
		let encodedURI = encodeURIComponent(this.getAddress());
		let url = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team216/";
		try {

			const response = await new Promise((resolve, reject) => {
				const req = http.get(url + encodedURI, (res) => {
					let body = "";

					res.on("data", (chunk) => {
						body = body + chunk;
					});

					res.on("end", () => {
						resolve(body);
					});
				});

				req.on("error", (error) => {
					reject(new InsightError("Could not get coordinates. "));
				});

				req.end();
			});

			let parsedBody = JSON.parse(response as string);
			this.location = {
				lat: parsedBody.lat,
				lon: parsedBody.lon
			};
			if (parsedBody.lat && parsedBody.lon) {
				this.setLat(parsedBody.lat);
				this.setLon(parsedBody.lon);
				this.counter.location = true;
			}

			return Promise.resolve();

		} catch {
			return Promise.resolve();
		}
	}

	public setFullname(fullname: string) {
		this.fullname = fullname;
	}

	public setShortname(shortname: string) {
		this.shortname = shortname;
	}

	public setNumber(number: string) {
		this.number = number;
		this.counter.number = true;
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
		this.counter.capacity = true;
	}

	public setType(type: string) {
		this.type = type;
		this.counter.type = true;
	}

	public setFurniture(furniture: string) {
		this.furniture = furniture;
		this.counter.furniture = true;
	}

	public setHref(href: string) {
		this.href = href;
		this.counter.href = true;
	}

	public setValid(valid: boolean) {
		this.valid = valid;
	}

	public sectionFromDisk(roomObject: any) {
		this.setFullname(roomObject["fullname"]);
		this.setShortname(roomObject["shortname"]);
		this.setNumber(roomObject["number"]);
		this.setName(roomObject["name"]);
		this.setAddress(roomObject["address"]);
		this.setLat(roomObject["lat"]);
		this.setLon(roomObject["lon"]);
		this.setSeats(roomObject["seats"]);
		this.setType(roomObject["type"]);
		this.setFurniture(roomObject["furniture"]);
		this.setHref(roomObject["href"]);
	}
}

import http from "http";
import {InsightError} from "../../controller/IInsightFacade";

export default class QueryObject {
	public getLocation() {
		return;
	}

	public getFullname() {
		return "";
	}

	public getShortname() {
		return "";
	}

	public getNumber() {
		return "";
	}

	public getName() {
		return "";
	}

	public getAddress() {
		return "";
	}

	public getLat() {
		return 0;
	}

	public getLon() {
		return 0;
	}

	public getSeats() {
		return 0;
	}

	public getType() {
		return "";
	}

	public getFurniture() {
		return "";
	}

	public getHref() {
		return "";
	}

	public getValid() {
		return false;
	}

	public async setLocation(): Promise<void> {
		return Promise.resolve();
	}

	public setFullname(fullname: string) {
		return;
	}

	public setShortname(shortname: string) {
		return;
	}

	public setNumber(number: string) {
		return;
	}

	public setName(name: string) {
		return;
	}

	public setAddress(address: string) {
		return;
	}

	public setLat(lat: number) {
		return;
	}

	public setLon(lon: number) {
		return;
	}

	public setSeats(seats: number) {
		return;
	}

	public setType(type: string) {
		return;
	}

	public setFurniture(furniture: string) {
		return;
	}

	public setHref(href: string) {
		return;
	}

	public queryObjectFromDisk(roomObject: any) {
		return;
	}

	public queryObjectFromJSON(jsonSection: any) {

	}

	public set_uuid(uuid: string) {
		return;
	}

	public set_id(id: string) {
		return;
	}

	public set_title(title: string) {
		return;
	}

	public set_instructor(instructor: string) {
		return;
	}

	public set_dept(dept: string) {
		return;
	}

	public set_year(year: number, jsonSection: any) {
		return;
	}

	public set_avg(avg: number) {
		return;
	}

	public set_pass(pass: number) {
		return;
	}

	public set_fail(fail: number) {
		return;
	}

	public set_audit(audit: number) {
		return;
	}

	public get_uuid(): string {
		return "";
	}

	public get_id(): string {
		return "";
	}

	public get_title(): string {
		return "";
	}

	public get_instructor(): string {
		return "";
	}

	public get_dept(): string {
		return "";
	}

	public get_year(): number {
		return 0;
	}

	public get_avg(): number {
		return 0;
	}

	public get_pass(): number {
		return 0;
	}

	public get_fail(): number {
		return 0;
	}

	public get_audit(): number {
		return 0;
	}


}

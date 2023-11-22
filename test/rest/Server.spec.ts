import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";

import {expect} from "chai";
import request, {Response} from "supertest";
import fs from "fs-extra";
import {clearDisk} from "../TestUtil";

describe("Facade D3", function () {

	let facade: InsightFacade;
	let server: Server;

	before(function () {
		facade = new InsightFacade();
		server = new Server(4321);
		// TODO: start server here once and handle errors properly
		clearDisk();

	});

	after(function () {
		// TODO: stop server here once!
		clearDisk();
	});

	beforeEach(function () {
		// might want to add some process logging here to keep track of what is going on
	});

	afterEach(function () {
		// might want to add some process logging here to keep track of what is going on
	});

	// Sample on how to format PUT requests
	/*
	it("PUT test for courses dataset", function () {
		try {
			return request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: Response) {
					// some logging here please!
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});
	*/
	describe("PUT tests", function() {
		let SERVER_URL = "http://localhost:4321";
		it("PUT test for courses dataset", function () {
			let ENDPOINT_URL = "/dataset/sections/sections";
			let ZIP_FILE_DATA = fs.readFileSync("test/resources/archives/smallpair.zip");
			try {
				return request(SERVER_URL)
					.put(ENDPOINT_URL)
					.send(ZIP_FILE_DATA)
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: Response) {
						console.log(res);
						expect(res.status).to.be.equal(200);
					})
					.catch(function (err) {
						console.log(err);
						expect.fail();
					});
			} catch (err) {
				console.log(err);
			}
		});
		it("PUT test for rooms dataset", function () {
			let ENDPOINT_URL = "/dataset/myRooms/rooms";
			let ZIP_FILE_DATA = fs.readFileSync("test/resources/archives/small_campus.zip");
			try {
				return request(SERVER_URL)
					.put(ENDPOINT_URL)
					.send(ZIP_FILE_DATA)
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: Response) {
						console.log(res);
						expect(res.status).to.be.equal(200);
					})
					.catch(function (err) {
						console.log(err);
						expect.fail();
					});
			} catch (err) {
				console.log(err);
			}
		});
		it("PUT test for courses dataset - fail on invalid Id - empty", function () {
			let ENDPOINT_URL = "/dataset/sections";
			let ZIP_FILE_DATA = fs.readFileSync("test/resources/archives/pair.zip");
			try {
				return request(SERVER_URL)
					.put(ENDPOINT_URL)
					.send(ZIP_FILE_DATA)
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: Response) {
						console.log(res);
						expect(res.status).to.be.equal(400);
					})
					.catch(function (err) {
						console.log(err);
						expect.fail();
					});
			} catch (err) {
				console.log(err);
			}
		});
		it("PUT test for courses dataset - fail on invalid Id - whitespace", function () {
			let ENDPOINT_URL = "/dataset/ /sections";
			let ZIP_FILE_DATA = fs.readFileSync("test/resources/archives/pair.zip");
			try {
				return request(SERVER_URL)
					.put(ENDPOINT_URL)
					.send(ZIP_FILE_DATA)
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: Response) {
						console.log(res);
						expect(res.status).to.be.equal(400);
					})
					.catch(function (err) {
						console.log(err);
						expect.fail();
					});
			} catch (err) {
				console.log(err);
			}
		});
	});
	describe("GET Tests", function() {
		let SERVER_URL = "http://localhost:4321";
		it("GET test for courses dataset - pass", function () {
			let PUT_ENDPOINT_URL = "/dataset/mysections/sections";
			let GET_ENDPOINT_URL = "/datasets";
			let ZIP_FILE_DATA = fs.readFileSync("test/resources/archives/pair.zip");
			try {
				request(SERVER_URL)
					.put(PUT_ENDPOINT_URL)
					.send(ZIP_FILE_DATA)
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: Response) {
						console.log(res);
						expect(res.status).to.be.equal(200);
					})
					.catch(function (err) {
						console.log(err);
						expect.fail();
					});
				return request(SERVER_URL)
					.get(GET_ENDPOINT_URL)
					.then(function (res: Response) {
						console.log(res);
						expect(res.status).to.be.equal(200);
					})
					.catch(function (err) {
						console.log(err);
						expect.fail();
					});
			} catch (err) {
				console.log(err);
			}
		});
	});

	describe("DELETE tests", function() {
		let SERVER_URL = "http://localhost:4321";
		it("DELETE test for courses dataset - pass", async function () {
			let PUT_ENDPOINT_URL = "/dataset/mysections/sections";
			let GET_ENDPOINT_URL = "/dataset/mysections";
			let ZIP_FILE_DATA = fs.readFileSync("test/resources/archives/smallpair.zip");
			try {
				await request(SERVER_URL)
					.put(PUT_ENDPOINT_URL)
					.send(ZIP_FILE_DATA)
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: Response) {
						console.log(res);
						expect(res.status).to.be.equal(200);
					})
					.catch(function (err) {
						console.log(err);
						expect.fail();
					});
				return request(SERVER_URL)
					.delete(GET_ENDPOINT_URL)
					.then(function (res: Response) {
						console.log(res);
						expect(res.status).to.be.equal(200);
					})
					.catch(function (err) {
						console.log(err);
						expect.fail();
					});
			} catch (err) {
				console.log(err);
			}
		});
		it("DELETE test for courses dataset - notFoundError", async function () {
			let PUT_ENDPOINT_URL = "/dataset/mysections/sections";
			let GET_ENDPOINT_URL = "/dataset/mysections";
			let ZIP_FILE_DATA = fs.readFileSync("test/resources/archives/pair.zip");
			try {
				return request(SERVER_URL)
					.delete(GET_ENDPOINT_URL)
					.then(function (res: Response) {
						console.log(res);
						expect(res.status).to.be.equal(404);
					})
					.catch(function (err) {
						console.log(err);
						expect.fail();
					});
			} catch (err) {
				console.log(err);
			}
		});
	});

	describe("POST Tests", function() {
		let SERVER_URL = "http://localhost:4321";
		it("POST test for sections dataset - pass", async function () {
			let PUT_ENDPOINT_URL = "/dataset/sections/sections";
			let POST_ENDPOINT_URL = "/query";
			let ZIP_FILE_DATA = fs.readFileSync("test/resources/archives/smallpair.zip");
			let QUERY_DATA = JSON.parse(fs.readFileSync(
				"test/resources/unordered_queries/APIQueries/validQuery.json", "utf-8"));
			try {
				await request(SERVER_URL)
					.put(PUT_ENDPOINT_URL)
					.send(ZIP_FILE_DATA)
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: Response) {
						console.log(res);
						expect(res.status).to.be.equal(200);
					})
					.catch(function (err) {
						console.log(err);
						expect.fail();
					});
				return request(SERVER_URL)
					.post(POST_ENDPOINT_URL)
					.send(QUERY_DATA)
					.set("Content-Type", "application/json")
					.then(function (res: Response) {
						console.log(res);
						expect(res.status).to.be.equal(200);
					})
					.catch(function (err) {
						console.log(err);
						expect.fail();
					});
			} catch (err) {
				console.log(err);
			}
		});
		it("POST test for sections dataset - fail", async function () {
			let PUT_ENDPOINT_URL = "/dataset/sections/sections";
			let POST_ENDPOINT_URL = "/query";
			let ZIP_FILE_DATA = fs.readFileSync("test/resources/archives/smallpair.zip");
			let QUERY_DATA = JSON.parse(fs.readFileSync(
				"test/resources/unordered_queries/APIQueries/invalidQueryStructure.json", "utf-8"));
			try {
				await request(SERVER_URL)
					.put(PUT_ENDPOINT_URL)
					.send(ZIP_FILE_DATA)
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: Response) {
						expect(res.status).to.be.equal(200);
					})
					.catch(function (err) {
						expect.fail();
					});
				return request(SERVER_URL)
					.post(POST_ENDPOINT_URL)
					.send(QUERY_DATA)
					.set("Content-Type", "application/json")
					.then(function (res: Response) {
						console.log(res);
						expect(res.status).to.be.equal(400);
					})
					.catch(function (err) {
						console.log(err);
						expect.fail();
					});
			} catch (err) {
				console.log(err);
			}
		});
	});

	// The other endpoints work similarly. You should be able to find all instructions at the supertest documentation
});

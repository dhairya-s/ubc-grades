import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError,
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";
import {folderTest} from "@ubccpsc310/folder-test";
import * as chai from "chai";
import {expect} from "chai";
import chaiAsPromised from "chai-as-promised";
import {clearDisk, getContentFromArchives} from "../TestUtil";

chai.use(chaiAsPromised);
describe("InsightFacade", function () {
	this.timeout(10000 * 6);
	let facade: IInsightFacade;

	// Declare datasets used in tests. You should add more datasets like this!
	let sections: string;
	let campus: string;

	before(function () {
		// This block runs once and loads the datasets.
		sections = getContentFromArchives("smallpair.zip");
		campus = getContentFromArchives("small_campus.zip");

		// Just in case there is anything hanging around from a previous run of the test suite
		clearDisk();
	});

	describe("Add/Remove/List Dataset", function () {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);
		});

		beforeEach(function () {
			// This section resets the insightFacade instance
			// This runs before each test
			console.info(`BeforeTest: ${this.currentTest?.title}`);
			facade = new InsightFacade();
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
		});

		afterEach(function () {
			// This section resets the data directory (removing any cached data)
			// This runs after each test, which should make each test independent of the previous one
			console.info(`AfterTest: ${this.currentTest?.title}`);
			clearDisk();
		});

		describe("AddDataset", () => {
			describe("TestValidateId", () => {
				it("should reject an empty string", () => {
					const result = facade.addDataset("", sections, InsightDatasetKind.Sections);
					return chai.expect(result).to.eventually.be.rejectedWith(InsightError);
				});
				it("should reject an id that is only whitespace (spaces)", () => {
					const result = facade.addDataset("  ", sections, InsightDatasetKind.Sections);
					return chai.expect(result).to.eventually.be.rejectedWith(InsightError);
				});
				it("should reject an id that is only whitespace (tab)", () => {
					const result = facade.addDataset("		", sections, InsightDatasetKind.Sections);
					return chai.expect(result).to.eventually.be.rejectedWith(InsightError);
				});
				it("should reject any id containing underscores (beginning)", () => {
					const result = facade.addDataset("_ubc", sections, InsightDatasetKind.Sections);
					return chai.expect(result).to.eventually.be.rejectedWith(InsightError);
				});
				it("should reject any id containing underscores (end)", () => {
					const result = facade.addDataset("ubc_", sections, InsightDatasetKind.Sections);
					return chai.expect(result).to.eventually.be.rejectedWith(InsightError);
				});
				it("should reject any id containing underscores (middle)", () => {
					const result = facade.addDataset("u_bc", sections, InsightDatasetKind.Sections);
					return chai.expect(result).to.eventually.be.rejectedWith(InsightError);
				});
			});
			describe("TestValidateContent", () => {
				describe("TestValidateSectionsKindContent", () => {
					it("rejects sections content that is not a zip file", async function() {
						const badDataset = getContentFromArchives("addDataset_test/not_a_zip.txt");
						const result = facade.addDataset("ubc", badDataset, InsightDatasetKind.Sections);
						return expect(result).to.eventually.be.rejectedWith(InsightError);
					});
					describe("TestValidCourse", () => {
						it("rejects if the course is not a valid JSON file", async function () {
							const badDataset = getContentFromArchives(
								"addDataset_test/not_a_valid_json_section.zip"
							);
							const result = facade.addDataset("ubc", badDataset, InsightDatasetKind.Sections);
							return expect(result).to.eventually.be.rejectedWith(InsightError);
						});
					});
					describe("TestValidSection", async function () {
						it(
							"rejects if it does not contain every field which" + " can be used by a query",
							async function () {
								// Removed ID field
								const badDataset = getContentFromArchives(
									"addDataset_test/missing_query_field.zip"
								);
								const result = facade.addDataset(
									"idstring",
									badDataset,
									InsightDatasetKind.Sections
								);
								return expect(result).to.eventually.be.rejectedWith(InsightError);
							});
						it("resolves if a non-intuitive value is given in the JSON", async function () {
							const badDataset = getContentFromArchives(
								"addDataset_test/non_intuitive_section_value.zip"
							);
							const result = facade.addDataset(
								"idstring",
								badDataset,
								InsightDatasetKind.Sections
							);
							const expected = ["idstring"];
							return expect(result).to.eventually.deep.members(expected);
						});
						it("resolves if it contains one or more valid sections", async function () {
							const badDataset = getContentFromArchives(
								"addDataset_test/contains_one_or_more_valid_sections.zip"
							);
							const result = facade.addDataset(
								"idstring",
								badDataset,
								InsightDatasetKind.Sections
							);
							const expected = ["idstring"];
							return expect(result).to.eventually.deep.members(expected);
						});
						it("rejects if it contains no valid sections", async function () {
							const badDataset = getContentFromArchives("addDataset_test/no_valid_section.zip");
							const result = facade.addDataset(
								"idstring",
								badDataset,
								InsightDatasetKind.Sections
							);
							return expect(result).to.eventually.be.rejectedWith(InsightError);
						});
						it("rejects if courses are not in /courses directory", async function () {
							const badDataset = getContentFromArchives(
								"addDataset_test/courses_not_in_courses_dir.zip"
							);
							const result = facade.addDataset(
								"idstring",
								badDataset,
								InsightDatasetKind.Sections
							);
							return expect(result).to.eventually.be.rejectedWith(InsightError);
						});
						it("rejects if it contains no valid courses", async function () {
							const badDataset = getContentFromArchives("addDataset_test/no_valid_courses.zip"); // Contains no "Pass" attribute.
							const result = facade.addDataset(
								"idstring",
								badDataset,
								InsightDatasetKind.Sections
							);
							return expect(result).to.eventually.be.rejectedWith(InsightError);
						});
					});

				});
				describe("TestValidateRoomsKindContent", () => {
					it("rejects rooms content that is not a zip file", () => {
						const badDataset = getContentFromArchives(
							"addDataset_test/not_a_valid_zip_rooms.txt"
						);
						const result = facade.addDataset("rooms", badDataset, InsightDatasetKind.Rooms);
						return expect(result).to.eventually.be.rejectedWith(InsightError);
					});
					it("resolves valid rooms content", async () => {
						const result = facade.addDataset("rooms", campus, InsightDatasetKind.Rooms);
						const expected = ["rooms"];
						return expect(result).to.eventually.deep.members(expected);
					});
					describe("invalid index.htm file", () => {
						it("rejects rooms content if it cannot find an index.htm file", () => {
							const badDataset = getContentFromArchives(
								"addDataset_test/no_index.zip"
							);
							const result = facade.addDataset("rooms", badDataset, InsightDatasetKind.Rooms);
							return expect(result).to.eventually.be.rejectedWith(InsightError);
						});
						// it("rejects rooms content if it cannot find a valid table in the index.htm", () => {
						// 	const badDataset = getContentFromArchives(
						// 		"addDataset_test/no_valid_table.zip"
						// 	);
						// 	const result = facade.addDataset("rooms", badDataset, InsightDatasetKind.Rooms)
						// 	return expect(result).to.eventually.be.rejectedWith(InsightError);
						// });
					});
					// describe("invalid building", () => {
					// 	it("rejects rooms content if it cannot find a building file linked from index", () => {
					// 		const badDataset = getContentFromArchives(
					// 			"addDataset_test/no_valid_building_file.zip"
					// 		);
					// 		const result = facade.addDataset("rooms", badDataset, InsightDatasetKind.Rooms)
					// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
					// 	});
					// 	it("rejects rooms content if it cannot find a single valid room", () => {
					// 		const badDataset = getContentFromArchives(
					// 			"addDataset_test/no_valid_room.zip"
					// 		);
					// 		const result = facade.addDataset("rooms", badDataset, InsightDatasetKind.Rooms)
					// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
					// 	});
					// 	it("rejects rooms content if found a room, but does not contain valid query keys", () => {
					// 		const badDataset = getContentFromArchives(
					// 			"addDataset_test/room_exists_not_valid.zip"
					// 		);
					// 		const result = facade.addDataset("rooms", badDataset, InsightDatasetKind.Rooms)
					// 		return expect(result).to.eventually.be.rejectedWith(InsightError);
					// 	});
					// 	describe("TestValidRoom", async function () {
					// 		it(
					// 			"rejects if room does not contain every field which" + " can be used by a query",
					// 			async function () {
					// 				// Removed ID field
					// 				const badDataset = getContentFromArchives(
					// 					"addDataset_test/room_missing_query_field.zip"
					// 				);
					// 				const result = facade.addDataset(
					// 					"campus",
					// 					badDataset,
					// 					InsightDatasetKind.Rooms
					// 				);
					// 				return expect(result).to.eventually.be.rejectedWith(InsightError);
					// 			});
					// 		it("resolves if a non-intuitive value is given in the room htm", async function () {
					// 			const badDataset = getContentFromArchives(
					// 				"addDataset_test/room_htm_non_intuitive_section_value.zip"
					// 			);
					// 			const result = facade.addDataset(
					// 				"campus",
					// 				badDataset,
					// 				InsightDatasetKind.Rooms
					// 			);
					// 			const expected = ["idstring"];
					// 			return expect(result).to.eventually.deep.members(expected);
					// 		});
					// 		it("resolves if it contains one or more valid rooms", async function () {
					// 			const badDataset = getContentFromArchives(
					// 				"addDataset_test/contains_one_or_more_valid_rooms.zip"
					// 			);
					// 			const result = facade.addDataset(
					// 				"campus",
					// 				badDataset,
					// 				InsightDatasetKind.Rooms
					// 			);
					// 			const expected = ["idstring"];
					// 			return expect(result).to.eventually.deep.members(expected);
					// 		});
					// 		it("rejects if it contains no valid rooms", async function () {
					// 			const badDataset = getContentFromArchives("addDataset_test/no_valid_room.zip");
					// 			const result = facade.addDataset(
					// 				"campus",
					// 				badDataset,
					// 				InsightDatasetKind.Rooms
					// 			);
					// 			return expect(result).to.eventually.be.rejectedWith(InsightError);
					// 		});
					// 		it("rejects if rooms are not linked properly", async function () {
					// 			const badDataset = getContentFromArchives(
					// 				"addDataset_test/rooms_not_linked_properly.zip"
					// 			);
					// 			const result = facade.addDataset(
					// 				"campus",
					// 				badDataset,
					// 				InsightDatasetKind.Rooms
					// 			);
					// 			return expect(result).to.eventually.be.rejectedWith(InsightError);
					// 		});
					// 		it("rejects if it contains no valid rooms", async function () {
					// 			const badDataset = getContentFromArchives("addDataset_test/no_valid_rooms.zip"); // Contains no "Pass" attribute.
					// 			const result = facade.addDataset(
					// 				"campus",
					// 				badDataset,
					// 				InsightDatasetKind.Rooms
					// 			);
					// 			return expect(result).to.eventually.be.rejectedWith(InsightError);
					// 		});
					// 	});
					// });
				});
			});
			describe("TestSaveDataset", () => {
				it("should resolve and send data to disk on successful add after a crash", async function () {
					const resultAdd = await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
					const datasets = await facade.listDatasets();
					// Fake a crash
					const newInsightFacade = new InsightFacade();
					const newDatasets = await newInsightFacade.listDatasets();
					return expect(datasets).to.deep.members(newDatasets);
				});
				it("should resolve and send data to disk on successful add of multiple datasets", async function () {
					const resultAdd1 = await facade.addDataset("dataset1", sections, InsightDatasetKind.Sections);
					const resultAdd2 = await facade.addDataset("dataset2", sections, InsightDatasetKind.Sections);
					const datasets = await facade.listDatasets();
					// Fake a crash
					const newInsightFacade = new InsightFacade();
					const newDatasets = await newInsightFacade.listDatasets();
					return expect(datasets).to.deep.members(newDatasets);
				});
				it("should resolve and send rooms data to disk on successful add after a crash", async function () {
					const resultAdd = await facade.addDataset("ubc", campus, InsightDatasetKind.Rooms);
					const datasets = await facade.listDatasets();
					// Fake a crash
					const newInsightFacade = new InsightFacade();
					const newDatasets = await newInsightFacade.listDatasets();
					return expect(datasets).to.deep.members(newDatasets);
				});
				it("should resolve and send rooms data to disk on successful add of multiple datasets",
					async function () {
						const resultAdd1 = await facade.addDataset("dataset1", campus, InsightDatasetKind.Rooms);
						const resultAdd2 = await facade.addDataset("dataset2", campus, InsightDatasetKind.Rooms);
						const datasets = await facade.listDatasets();
					// Fake a crash
						const newInsightFacade = new InsightFacade();
						const newDatasets = await newInsightFacade.listDatasets();
						return expect(datasets).to.deep.members(newDatasets);
					});
			});
			it("should resolve with valid arguments", async () => {
				const result = await facade.addDataset("abc", sections, InsightDatasetKind.Sections);
				return chai.expect(result).to.deep.equals(["abc"]);
			});
			it("should resolve with multiple datasets", async () => {
				const result1 = await facade.addDataset("abc", sections, InsightDatasetKind.Sections);
				const result2 = await facade.addDataset("def", sections, InsightDatasetKind.Sections);
				return chai.expect(result2).to.deep.equals(["abc", "def"]);
			});
			it("should resolve rooms with valid arguments", async () => {
				const result = await facade.addDataset("abc", campus, InsightDatasetKind.Rooms);
				return chai.expect(result).to.deep.equals(["abc"]);
			});
			it("should resolve rooms with multiple datasets", async () => {
				const result1 = await facade.addDataset("abc", campus, InsightDatasetKind.Rooms);
				const result2 = await facade.addDataset("def", campus, InsightDatasetKind.Rooms);
				return chai.expect(result2).to.deep.equals(["abc", "def"]);
			});
		});

		describe("RemoveDataset", () => {
			it("should reject if attempts to remove a dataset that has not been added " + "with NotFoundError",
				async function () {
					const resultRemove = facade.removeDataset("dataset1");
					return expect(resultRemove).to.eventually.be.rejectedWith(NotFoundError);
				}
			);

			it("should resolve if removes an existing dataset", async function () {
				const result1 = await facade.addDataset("dataset1", sections, InsightDatasetKind.Sections);
				const result2 = await facade.addDataset("dataset2", sections, InsightDatasetKind.Sections);
				const resultRemove = facade.removeDataset("dataset1");
				return expect(resultRemove).to.eventually.deep.equals("dataset1");
			});

			describe("test removeDataset with disk data after crash", function () {
				it(
					"should resolve and return an updated list of the data stored on disk " + "when data is removed",
					async function () {
						const result1 = await facade.addDataset("dataset1", sections, InsightDatasetKind.Sections);
						const datasets1 = await facade.listDatasets();
						const result2 = await facade.addDataset("dataset2", sections, InsightDatasetKind.Sections);
						const resultRemove = await facade.removeDataset("dataset2");
						const datasets = await facade.listDatasets();
						return expect(datasets).to.deep.members(datasets1);
					}
				);
				it(
					"should resolve and return an updated list of the data stored on disk when " + "crashed",
					async function () {
						const result1 = await facade.addDataset("dataset1", sections, InsightDatasetKind.Sections);
						const result2 = await facade.addDataset("dataset2", sections, InsightDatasetKind.Sections);
						const resultRemove = await facade.removeDataset("dataset1");
						const dataBeforeCrash = await facade.listDatasets();
						// Fake a crash here
						const newInstance = new InsightFacade();
						const datasets = await newInstance.listDatasets();
						return expect(datasets).to.deep.members(dataBeforeCrash);
					}
				);
			});
		});

		describe("ListDataset", () => {
			let validSections: string;
			before(function () {
				sections = getContentFromArchives("smallpair.zip");
				validSections = getContentFromArchives("addDataset_test/contains_one_or_more_valid_sections.zip");
			});
			describe("list all currently added datasets, types, and number of rows", function () {
				it("should resolve if there have been no datasets added", async function () {
					const datasets = await facade.listDatasets();
					return expect(datasets).to.deep.equal([]);
				});
				it("should resolve if there has been a dataset added and removed", async function () {
					const result1 = await facade.addDataset("dataset1", sections, InsightDatasetKind.Sections);
					const result2 = await facade.removeDataset("dataset1");
					const datasets = await facade.listDatasets();
					return expect(datasets).to.deep.equal([]);
				});
				it("should resolve if there has been a dataset added and removed with one extra added",
					async function () {
						const result1 = await facade.addDataset("dataset1", sections, InsightDatasetKind.Sections);
						const result2 = await facade.addDataset("dataset2", sections, InsightDatasetKind.Sections);
						const result1Remove = await facade.removeDataset("dataset1");
						const datasets = await facade.listDatasets();
						return expect(datasets).to.deep.equal([{id: "dataset2", kind: "sections", numRows: 5298}]);
					});
				it("should resolve if there has been a dataset added", async function () {
					const result1 = await facade.addDataset("dataset1", sections, InsightDatasetKind.Sections);
					const datasets = await facade.listDatasets();
					return expect(datasets).to.deep.equal([{id: "dataset1", kind: "sections", numRows: 5298}]);
				});
				it("should resolve if there have been many datasets added", async function () {
					const result1 = await facade.addDataset("dataset1", sections, InsightDatasetKind.Sections);
					const result2 = await facade.addDataset("dataset2", validSections, InsightDatasetKind.Sections);
					const datasets = await facade.listDatasets();
					// console.log(datasets);
					return expect(datasets).to.deep.equal([
						{id: "dataset1", kind: "sections", numRows: 5298},
						{id: "dataset2", kind: "sections", numRows: 1},
					]);
				});
				it("should resolve after a crash containing previously added datasets", async function () {
					const result1 = await facade.addDataset("dataset1", sections, InsightDatasetKind.Sections);
					const result2 = await facade.addDataset("dataset2", validSections, InsightDatasetKind.Sections);
					const datasets = await facade.listDatasets();
					// console.log(datasets);
					let newFacade = new InsightFacade();
					const loadedDatasets = await newFacade.listDatasets();
					return expect(loadedDatasets).to.deep.equal([
						{id: "dataset1", kind: "sections", numRows: 5298},
						{id: "dataset2", kind: "sections", numRows: 1},
					]);
				});
			});
		});
	});

	/*
	 * This test suite dynamically generates tests from the JSON files in test/resources/queries.
	 * You should not need to modify it; instead, add additional files to the queries directory.
	 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
	 */
	describe("PerformQuery", () => {
		before(function () {
			console.info(`Before: ${this.test?.parent?.title}`);
			sections = getContentFromArchives("pair.zip");
			campus = getContentFromArchives("campus.zip");

			clearDisk();
			facade = new InsightFacade();

			// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
			// Will *fail* if there is a problem reading ANY dataset.
			const loadDatasetPromisesSections = [facade.addDataset("sections", sections, InsightDatasetKind.Sections)];
			const loadDatasetPromisesRooms = [facade.addDataset("rooms", campus, InsightDatasetKind.Rooms)];
			const loadDatasetPromises = loadDatasetPromisesRooms.concat(loadDatasetPromisesSections);

			return Promise.all(loadDatasetPromises);
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			clearDisk();
		});

		type PQErrorKind = "ResultTooLargeError" | "InsightError";

		// for queries with order
		folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
			"Dynamic InsightFacade PerformQuery Ordered tests",
			(input) => facade.performQuery(input),
			"./test/resources/ordered_queries/test_queries",

			{
				assertOnResult: async (actual, expected) => {
					expect(actual).to.deep.equals(await expected);
				},
				errorValidator: (error): error is PQErrorKind =>
					error === "ResultTooLargeError" || error === "InsightError",
				assertOnError: (actual, expected) => {
					if (expected === "InsightError") {
						expect(actual).to.be.instanceof(InsightError);
					} else if (expected === "ResultTooLargeError") {
						expect(actual).to.be.instanceof(ResultTooLargeError);
					} else {
						// this should be unreachable
						expect.fail("UNEXPECTED ERROR");
					}
				},
			}
		);
		folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
			"Dynamic InsightFacade PerformQuery Unordered tests",
			(input) => facade.performQuery(input),
			"./test/resources/unordered_queries/test_queries",

			{
				assertOnResult: async (actual, expected) => {
					expect(actual).to.have.deep.members(await expected);
				},
				errorValidator: (error): error is PQErrorKind =>
					error === "ResultTooLargeError" || error === "InsightError",
				assertOnError: (actual, expected) => {
					if (expected === "InsightError") {
						expect(actual).to.be.instanceof(InsightError);
					} else if (expected === "ResultTooLargeError") {
						expect(actual).to.be.instanceof(ResultTooLargeError);
					} else {
						// this should be unreachable
						expect.fail("UNEXPECTED ERROR");
					}
				},
			}
		);


		folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
			"Dynamic InsightFacade PerformQuery Ordered tests (Rooms)",
			(input) => facade.performQuery(input),
			"./test/resources/ordered_queries/RoomTests",

			{
				assertOnResult: async (actual, expected) => {
					expect(actual).to.deep.equals(await expected);
				},
				errorValidator: (error): error is PQErrorKind =>
					error === "ResultTooLargeError" || error === "InsightError",
				assertOnError: (actual, expected) => {
					if (expected === "InsightError") {
						expect(actual).to.be.instanceof(InsightError);
					} else if (expected === "ResultTooLargeError") {
						expect(actual).to.be.instanceof(ResultTooLargeError);
					} else {
						// this should be unreachable
						expect.fail("UNEXPECTED ERROR");
					}
				},
			}
		);
		folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
			"Dynamic InsightFacade PerformQuery Unordered tests (Rooms)",
			(input) => facade.performQuery(input),
			"./test/resources/unordered_queries/RoomTests",

			{
				assertOnResult: async (actual, expected) => {
					expect(actual).to.have.deep.members(await expected);
				},
				errorValidator: (error): error is PQErrorKind =>
					error === "ResultTooLargeError" || error === "InsightError",
				assertOnError: (actual, expected) => {
					if (expected === "InsightError") {
						expect(actual).to.be.instanceof(InsightError);
					} else if (expected === "ResultTooLargeError") {
						expect(actual).to.be.instanceof(ResultTooLargeError);
					} else {
						// this should be unreachable
						expect.fail("UNEXPECTED ERROR");
					}
				},
			}
		);

	});
});

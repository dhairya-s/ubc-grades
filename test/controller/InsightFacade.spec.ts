import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	InsightResult, NotFoundError,
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

	before(function () {
		// This block runs once and loads the datasets.
		sections = getContentFromArchives("smallpair.zip");

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
				it("should reject an id that is only whitespace", () => {
					const result = facade.addDataset("  ", sections, InsightDatasetKind.Sections);
					return chai.expect(result).to.eventually.be.rejectedWith(InsightError);
				});
				it("should reject an id that is only whitespace", () => {
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
				// describe("TestValidateRoomsKindContent", () => {
				// 	// TODO: This needs to be finished for C2.
				// });
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

			facade = new InsightFacade();

			// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
			// Will *fail* if there is a problem reading ANY dataset.
			const loadDatasetPromises = [facade.addDataset("sections", sections, InsightDatasetKind.Sections)];

			return Promise.all(loadDatasetPromises);
		});

		after(function () {
			console.info(`After: ${this.test?.parent?.title}`);
			clearDisk();
		});

		type PQErrorKind = "ResultTooLargeError" | "InsightError";

		folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
			"Dynamic InsightFacade PerformQuery tests",
			(input) => facade.performQuery(input),
			// "./test/resources/queries",
			"./test/resources/ordered_queries",

			{
				assertOnResult: async (actual, expected) => {
					// expect(actual).to.have.deep.members(await expected);
					// let expectedLoaded = await expected;
					expect(actual).to.deep.equals(await expected);
					// if (expectedLoaded.length === 1 || expectedLoaded.length === 0) {
					// 	expect(actual).to.have.deep.members(await expected);
					// } else {
					// 	expect(actual).to.have.deep.equals(await expected);
					// }

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

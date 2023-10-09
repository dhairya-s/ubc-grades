import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";

import {folderTest} from "@ubccpsc310/folder-test";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import {clearDisk, getContentFromArchives} from "../TestUtil";

use(chaiAsPromised);

describe("InsightFacade", function () {
	let facade: IInsightFacade;

	// Declare datasets used in tests. You should add more datasets like this!
	let sections: string;

	before(function () {
		// This block runs once and loads the datasets.
		sections = getContentFromArchives("pair.zip");

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

		describe("in addDataset, ", async function() {
			describe("test idstring for validity", async function() {
				it ("should reject with  an empty dataset id", function() {
					const result = facade.addDataset("", sections, InsightDatasetKind.Sections);
					return expect(result).to.eventually.be.rejectedWith(InsightError);
				});

				describe("test idstring containing underscore", async function() {
					it("should reject with an idstring containing an " +
						"underscore as the only element", async function() {
						const result = facade.addDataset("_", sections, InsightDatasetKind.Sections);
						return expect(result).to.eventually.be.rejectedWith(InsightError);
					});
					it("should reject with an idstring containing an " +
						"underscore in the middle of the idstring", async function() {
						const result = facade.addDataset(
							"id_string", sections, InsightDatasetKind.Sections
						);
						return expect(result).to.eventually.be.rejectedWith(InsightError);
					});
					it("should reject with an idstring containing an " +
						"underscore at the beginning of the idstring", async function() {
						const result = facade.addDataset(
							"_idstring", sections, InsightDatasetKind.Sections
						);
						return expect(result).to.eventually.be.rejectedWith(InsightError);
					});
					it("should reject with an idstring containing an " +
						"underscore at the end of the idstring", async function() {
						const result = facade.addDataset(
							"idstring_", sections, InsightDatasetKind.Sections
						);
						return expect(result).to.eventually.be.rejectedWith(InsightError);
					});
				});

				it("should resolve with a permissible dataset id", async function () {
					this.timeout(6000); // A very long environment setup.
					let result = await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
					return expect(result).to.deep.equals(["ubc"]);
				});
			});

			describe("test valid content", async function() {
				describe("test valid dataset", async function() {

					it("rejects content that is not a zip file", async function() {
						const badDataset = getContentFromArchives("addDataset_test/not_a_zip.txt");
						const result = facade.addDataset(
							"idstring", badDataset, InsightDatasetKind.Sections);
						return expect(result).to.eventually.be.rejectedWith(InsightError);
					});

					describe("test for valid sections", async function(){
						describe("test for valid course", async function(){

							it("rejects if the course is not a valid JSON file", async function() {
								const badDataset = getContentFromArchives(
									"addDataset_test/not_a_valid_json_section.zip");
								const result = facade.addDataset(
									"idstring", badDataset, InsightDatasetKind.Sections);
								return expect(result).to.eventually.be.rejectedWith(InsightError);
							});

							describe("test for valid section", async function() {
								it("rejects if it does not contain every field which" +
									" can be used by a query", async function() {
									// Removed ID field
									const badDataset = getContentFromArchives(
										"addDataset_test/missing_query_field.zip"
									);
									const result = facade.addDataset(
										"idstring", badDataset, InsightDatasetKind.Sections
									);
									return expect(result).to.eventually.be.rejectedWith(InsightError);
								});
								it("resolves if a non-intuitive value is given in the JSON", async function() {
									const badDataset = getContentFromArchives(
										"addDataset_test/non_intuitive_section_value.zip"
									);
									const result = facade.addDataset(
										"idstring", badDataset, InsightDatasetKind.Sections
									);
									const expected = ["idstring"];
									return expect(result).to.eventually.deep.members(expected);
								});
								it("resolves if it contains one or more valid sections", async function() {
									const badDataset = getContentFromArchives(
										"addDataset_test/contains_one_or_more_valid_sections.zip"
									);
									const result = facade.addDataset(
										"idstring", badDataset, InsightDatasetKind.Sections);
									const expected = ["idstring"];
									return expect(result).to.eventually.deep.members(expected);
								});
								it("rejects if it contains no valid sections", async function(){
									const badDataset = getContentFromArchives(
										"addDataset_test/no_valid_section.zip"
									);
									const result = facade.addDataset(
										"idstring", badDataset, InsightDatasetKind.Sections
									);
									return expect(result).to.eventually.be.rejectedWith(InsightError);
								});
								it("rejects if courses are not in /courses directory", async function() {
									const badDataset = getContentFromArchives(
										"addDataset_test/courses_not_in_courses_dir.zip"
									);
									const result = facade.addDataset(
										"idstring", badDataset, InsightDatasetKind.Sections
									);
									return expect(result).to.eventually.be.rejectedWith(InsightError);
								});
								it("rejects if it contains no valid courses", async function() {
									const badDataset = getContentFromArchives(
										"addDataset_test/no_valid_courses.zip"
									); // Contains no "Pass" attribute.
									const result = facade.addDataset(
										"idstring", badDataset, InsightDatasetKind.Sections
									);
									return expect(result).to.eventually.be.rejectedWith(InsightError);
								});
							});
						});
					});

				});

			});
			describe("test_valid_kind", async function() {
				it("should reject with rooms kind", async function() {
					const result = facade.addDataset("idString", sections, InsightDatasetKind.Rooms);
					return expect(result).to.eventually.be.rejectedWith(InsightError);
				});
				it("should resolve with the Sections kind", async function() {
					this.timeout(6000); // A very long environment setup.
					const result = facade.addDataset("idString", sections, InsightDatasetKind.Sections);
					return expect(result).to.eventually.deep.members(["idString"]);
				});
			});

			describe("expected output", async function() {
				it("should resolve with multiple datasets added", async function() {
					this.timeout(8000); // A very long environment setup.
					const result1 = await facade.addDataset("dataset1", sections, InsightDatasetKind.Sections);
					const result2 = facade.addDataset("dataset2", sections, InsightDatasetKind.Sections);
					return expect(result2).to.eventually.deep.members(["dataset1", "dataset2"]);
				});
				it("should reject with an idstring that has already been added", async function() {
					this.timeout(8000); // A very long environment setup.
					const result1 = await facade.addDataset("dataset1", sections, InsightDatasetKind.Sections);
					const result2 = facade.addDataset("dataset1", sections, InsightDatasetKind.Sections);
					return expect(result2).to.eventually.be.rejectedWith(InsightError);
				});
			});

			describe("test save to disk", async function() {
				it("should resolve and send data to disk on successful add", async function() {
					this.timeout(6000); // A very long environment setup.
					const resultAdd = await facade.addDataset("dataset1", sections, InsightDatasetKind.Sections);
					const datasets = await facade.listDatasets();
					return expect(datasets).to.deep.members([{
						id:"dataset1",
						kind: InsightDatasetKind.Sections,
						numRows: 5298
					}]);
				});
				it("should resolve and send data to disk on successful add of multiple datasets", async function() {
					this.timeout(8000); // A very long environment setup.
					const resultAdd1 = await facade.addDataset("dataset1", sections, InsightDatasetKind.Sections);
					const resultAdd2 = await facade.addDataset("dataset2", sections, InsightDatasetKind.Sections);

					const datasets = await facade.listDatasets();

					return expect(datasets).to.deep.members([
						{
							id:"dataset1",
							kind: InsightDatasetKind.Sections,
							numRows: 5298
						},
						{
							id:"dataset2",
							kind: InsightDatasetKind.Sections,
							numRows: 5298
						}]);
				});
			});

			it("should save data to disk and be readable after a crash", async function() {
				const result = await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
				// Fake a crash
				const newInstance = new InsightFacade();
				const datasets = await newInstance.listDatasets();
				return expect(datasets).to.deep.members([{
					id:"dataset1",
					kind: InsightDatasetKind.Sections,
					numRows: 5298
				}]);
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

			facade = new InsightFacade();

			// Load the datasets specified in datasetsToQuery and add them to InsightFacade.
			// Will *fail* if there is a problem reading ANY dataset.
			const loadDatasetPromises = [
				facade.addDataset("sections", sections, InsightDatasetKind.Sections),
			];

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
			"./test/resources/queries",
			{
				assertOnResult: (actual, expected) => {
					// TODO add an assertion!
				},
				errorValidator: (error): error is PQErrorKind =>
					error === "ResultTooLargeError" || error === "InsightError",
				assertOnError: (actual, expected) => {
					// TODO add an assertion!
				},
			}
		);
	});
});

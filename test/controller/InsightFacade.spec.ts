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

				});
				describe("TestValidateRoomsKindContent", () => {

				});
			});
			describe("TestSaveDataset", () => {

			});
			it("should accept a valid string", () => {
				const result = facade.addDataset("abc", sections, InsightDatasetKind.Sections);
				return chai.expect(result).to.eventually.deep.equals(["ubc"]);
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

		// for queries with order
		folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
			"Dynamic InsightFacade PerformQuery tests",
			(input) => facade.performQuery(input),
			"./test/resources/ordered_queries",

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

		// for queries without order
		folderTest<unknown, Promise<InsightResult[]>, PQErrorKind>(
			"Dynamic InsightFacade PerformQuery tests",
			(input) => facade.performQuery(input),
			// "./test/resources/queries",
			"./test/resources/unordered_queries",

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

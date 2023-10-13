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

		it("should reject with an empty dataset id", function () {
			const result = facade.addDataset("", sections, InsightDatasetKind.Sections);
			return chai.expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with  an _ in dataset id", function () {
			const result = facade.addDataset("ubc_", sections, InsightDatasetKind.Sections);
			return chai.expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with only whitespace dataset id (spaces)", function () {
			const result = facade.addDataset(" ", sections, InsightDatasetKind.Sections);
			return chai.expect(result).to.eventually.be.rejectedWith(InsightError);
		});
		it("should reject with only whitespace dataset id (tabs)", function () {
			const result = facade.addDataset(" 	", sections, InsightDatasetKind.Sections);
			return chai.expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should accept with the [ubc] sections dataset", function () {
			const result = facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
			return chai.expect(result).to.eventually.have.members(["ubc"]);
		});

		it("should reject with the [ubc] sections_tiny dataset twice", function () {
			const result = facade
				.addDataset("ubc", sections, InsightDatasetKind.Sections)
				.then(() => facade.addDataset("ubc", sections, InsightDatasetKind.Sections));
			return chai.expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with empty content", function () {
			const result = facade.addDataset("ubc", "", InsightDatasetKind.Sections);
			return chai.expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with the wrong kind", function () {
			const result = facade.addDataset("ubc", sections, InsightDatasetKind.Rooms);
			return chai.expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should accept with the id = [^]+ubc] sections_tiny dataset", function () {
			const result = facade.addDataset("[^]+ubc]", sections, InsightDatasetKind.Sections);
			return chai.expect(result).to.eventually.have.members(["[^]+ubc]"]);
		});
		it("should reject with an InsightError for empty dataset id", function () {
			const result = facade.removeDataset("");
			return chai.expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with an InsightError for _ in dataset id", function () {
			const result = facade.removeDataset("ubc_");
			return chai.expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with an InsightError for whitespace as dataset id", function () {
			const result = facade.removeDataset(" ");
			return chai.expect(result).to.eventually.be.rejectedWith(InsightError);
		});

		it("should reject with an NotFoundError for valid dataset id", function () {
			const result = facade.removeDataset("ubc");
			return chai.expect(result).to.eventually.be.rejectedWith(NotFoundError);
		});

		it("should accept for valid dataset id", function () {
			const result = facade
				.addDataset("ubc", sections, InsightDatasetKind.Sections)
				.then(() => facade.removeDataset("ubc"));
			return chai.expect(result).to.eventually.equals("ubc");
		});

		it("should accept for valid dataset id = [^]+ubc]", function () {
			const result = facade
				.addDataset("[^]+ubc]", sections, InsightDatasetKind.Sections)
				.then(() => facade.removeDataset("[^]+ubc]"));

			return chai.expect(result).to.eventually.equals("[^]+ubc]");
		});

		it("should reject for double delete for valid dataset id", function () {
			const result = facade
				.addDataset("ubc", sections, InsightDatasetKind.Sections)
				.then(() => facade.removeDataset("ubc"))
				.then(() => facade.removeDataset("ubc"));
			return chai.expect(result).to.eventually.be.rejectedWith(NotFoundError);
		});

		it("should accept for empty dataset", function () {
			const result = facade.listDatasets();
			return chai.expect(result).to.eventually.be.an("array").that.is.empty;
		});

		it("should accept for add then remove valid datasets", function () {
			const result = facade
				.addDataset("ubc", sections, InsightDatasetKind.Sections)
				.then(() => facade.removeDataset("ubc"))
				.then(() => facade.listDatasets());
			return chai.expect(result).to.eventually.be.an("array").that.is.empty;
		});

		it("should accept for add -> list len", function () {
			const result = facade
				.addDataset("ubc", sections, InsightDatasetKind.Sections)
				.then(() => facade.listDatasets());
			return chai.expect(result).to.eventually.have.lengthOf(1);
		});

		describe("in addDataset, ", async function () {
			describe("test idstring for validity", async function () {
				it("should reject with  an empty dataset id", function () {
					const result = facade.addDataset("", sections, InsightDatasetKind.Sections);
					return expect(result).to.eventually.be.rejectedWith(InsightError);
				});

				describe("test idstring containing underscore", async function () {
					it(
						"should reject with an idstring containing an " + "underscore as the only element",
						async function () {
							const result = facade.addDataset("_", sections, InsightDatasetKind.Sections);
							return expect(result).to.eventually.be.rejectedWith(InsightError);
						}
					);
					it(
						"should reject with an idstring containing an " + "underscore in the middle of the idstring",
						async function () {
							const result = facade.addDataset("id_string", sections, InsightDatasetKind.Sections);
							return expect(result).to.eventually.be.rejectedWith(InsightError);
						}
					);
					it(
						"should reject with an idstring containing an " + "underscore at the beginning of the idstring",
						async function () {
							const result = facade.addDataset("_idstring", sections, InsightDatasetKind.Sections);
							return expect(result).to.eventually.be.rejectedWith(InsightError);
						}
					);
					it(
						"should reject with an idstring containing an " + "underscore at the end of the idstring",
						async function () {
							const result = facade.addDataset("idstring_", sections, InsightDatasetKind.Sections);
							return expect(result).to.eventually.be.rejectedWith(InsightError);
						}
					);
				});

				it("should resolve with a permissible dataset id", async function () {
					// this.timeout(6000); // A very long environment setup.
					let result = await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
					return expect(result).to.deep.equals(["ubc"]);
				});
				it("should reject after a crash if a duplicate id is given", async function () {
					const result = await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
					let newFacade = new InsightFacade();
					const result2 = newFacade.addDataset("ubc", sections, InsightDatasetKind.Sections);
					return expect(result2).to.eventually.be.rejectedWith(InsightError);
				});
			});

			describe("test valid content", async function () {
				describe("test valid dataset", async function () {
					it("rejects content that is not a zip file", async function () {
						const badDataset = getContentFromArchives("addDataset_test/not_a_zip.txt");
						const result = facade.addDataset("idstring", badDataset, InsightDatasetKind.Sections);
						return expect(result).to.eventually.be.rejectedWith(InsightError);
					});

					describe("test for valid sections", async function () {
						describe("test for valid course", async function () {
							it("rejects if the course is not a valid JSON file", async function () {
								const badDataset = getContentFromArchives(
									"addDataset_test/not_a_valid_json_section.zip"
								);
								const result = facade.addDataset("idstring", badDataset, InsightDatasetKind.Sections);
								return expect(result).to.eventually.be.rejectedWith(InsightError);
							});

							describe("test for valid section", async function () {
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
									}
								);
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
					});
				});
			});
			describe("test_valid_kind", async function () {
				it("should reject with rooms kind", async function () {
					const result = facade.addDataset("idString", sections, InsightDatasetKind.Rooms);
					return expect(result).to.eventually.be.rejectedWith(InsightError);
				});
				it("should resolve with the Sections kind", async function () {
					// this.timeout(6000); // A very long environment setup.
					const result = facade.addDataset("idString", sections, InsightDatasetKind.Sections);
					return expect(result).to.eventually.deep.members(["idString"]);
				});
			});

			describe("expected output", async function () {
				it("should resolve with multiple datasets added", async function () {
					// this.timeout(8000); // A very long environment setup.
					const result1 = await facade.addDataset("dataset1", sections, InsightDatasetKind.Sections);
					const result2 = facade.addDataset("dataset2", sections, InsightDatasetKind.Sections);
					return expect(result2).to.eventually.deep.members(["dataset1", "dataset2"]);
				});
				it("should reject with an idstring that has already been added", async function () {
					// this.timeout(8000); // A very long environment setup.
					const result1 = await facade.addDataset("dataset1", sections, InsightDatasetKind.Sections);
					const result2 = facade.addDataset("dataset1", sections, InsightDatasetKind.Sections);
					return expect(result2).to.eventually.be.rejectedWith(InsightError);
				});
			});

			describe("test save to disk", async function () {
				it("should resolve and send data to disk on successful add", async function () {
					// this.timeout(30000); // A very long environment setup.
					const resultAdd = await facade.addDataset("dataset1", sections, InsightDatasetKind.Sections);
					const datasets = await facade.listDatasets();
					const newInsightFacade = new InsightFacade();
					const newDatasets = await newInsightFacade.listDatasets();
					return expect(datasets).to.deep.members(newDatasets);
				});
				it("should resolve and send data to disk on successful add of multiple datasets", async function () {
					// this.timeout(30000); // A very long environment setup.
					const resultAdd1 = await facade.addDataset("dataset1", sections, InsightDatasetKind.Sections);
					const resultAdd2 = await facade.addDataset("dataset2", sections, InsightDatasetKind.Sections);
					const datasets = await facade.listDatasets();
					const newInsightFacade = new InsightFacade();
					const newDatasets = await newInsightFacade.listDatasets();
					return expect(datasets).to.deep.members(newDatasets);
				});
			});

			it("should save data to disk and be readable after a crash", async function () {
				// this.timeout(30000); // A very long environment setup.
				const result = await facade.addDataset("ubc", sections, InsightDatasetKind.Sections);
				const datasets = await facade.listDatasets();
				// Fake a crash
				const newInstance = new InsightFacade();
				const newDatasets = await newInstance.listDatasets();
				return expect(datasets).to.deep.members(newDatasets);
			});
		});

		describe("removeDataset", function () {
			before(function () {
				console.info(`Before: ${this.test?.parent?.title}`);
				sections = getContentFromArchives("smallpair.zip");
			});
			it("should succeed if tries to remove a dataset added before a crash", async function () {
				const result1 = await facade.addDataset("dataset1", sections, InsightDatasetKind.Sections);
				let newFacade = new InsightFacade();
				const resultRemove = newFacade.removeDataset("dataset1");
				return expect(resultRemove).to.eventually.deep.equals("dataset1");
			});
			it("should succeed if tries to remove a dataset removed before a crash", async function () {
				const result1 = await facade.addDataset("dataset1", sections, InsightDatasetKind.Sections);
				const result2 = await facade.addDataset("dataset2", sections, InsightDatasetKind.Sections);
				const result3 = await facade.addDataset("dataset3", sections, InsightDatasetKind.Sections);
				const resultRemove1 = await facade.removeDataset("dataset1");
				let newFacade = new InsightFacade();
				const resultRemove = newFacade.removeDataset("dataset1");
				return expect(resultRemove).to.eventually.be.rejectedWith(NotFoundError);
			});
			describe("test id parameter", function () {
				it(
					"should reject if attempts to remove a dataset that has not been added " + "with NotFoundError",
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

				describe("remove - test idstring containing underscore", async function () {
					it(
						"remove - should reject with an idstring containing an underscore as the " + "only element",
						async function () {
							const result1 = facade.removeDataset("_");
							return expect(result1).to.eventually.be.rejectedWith(InsightError);
						}
					);
					it(
						"remove - should reject with an idstring containing an underscore " +
							"in the middle of the idstring",
						async function () {
							const result1 = facade.removeDataset("id_string");
							return expect(result1).to.eventually.be.rejectedWith(InsightError);
						}
					);
					it(
						"remove - should reject with an idstring containing an underscore at " +
							"the beginning of the idstring",
						async function () {
							const result1 = facade.removeDataset("_idstring");
							return expect(result1).to.eventually.be.rejectedWith(InsightError);
						}
					);
					it(
						"remove - should reject with an idstring containing an underscore at " +
							"the end of the idstring",
						async function () {
							const result1 = facade.removeDataset("idstring_");
							return expect(result1).to.eventually.be.rejectedWith(InsightError);
						}
					);
				});
				describe("test id with whitespace characters", function () {
					it("should reject an id with only spaces", async function () {
						const result1 = facade.removeDataset(" ");
						return expect(result1).to.eventually.be.rejectedWith(InsightError);
					});
					it("should reject an id with tabs", async function () {
						const result1 = facade.removeDataset("  ");
						return expect(result1).to.eventually.be.rejectedWith(InsightError);
					});
					it("should resolve an id with whitespace in the id", async function () {
						const result1 = await facade.addDataset("id string", sections, InsightDatasetKind.Sections);
						const resultRemove = facade.removeDataset("id string");
						return expect(resultRemove).to.eventually.deep.equals("id string");
					});
				});
			});
			describe("test updating disk data", function () {
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

		describe("listDataset", function () {
			let validSections: string;
			before(function () {
				sections = getContentFromArchives("pair.zip");
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
						this.timeout(4000);
						const result1 = await facade.addDataset("dataset1", sections, InsightDatasetKind.Sections);
						const result2 = await facade.addDataset("dataset2", sections, InsightDatasetKind.Sections);
						const result1Remove = await facade.removeDataset("dataset1");
						const datasets = await facade.listDatasets();
						return expect(datasets).to.deep.equal([{id: "dataset2", kind: "sections", numRows: 64612}]);
					});
				it("should resolve if there has been a dataset added", async function () {
					this.timeout(4000);
					const result1 = await facade.addDataset("dataset1", sections, InsightDatasetKind.Sections);
					const datasets = await facade.listDatasets();
					return expect(datasets).to.deep.equal([{id: "dataset1", kind: "sections", numRows: 64612}]);
				});
				it("should resolve if there have been many datasets added", async function () {
					this.timeout(4000);
					const result1 = await facade.addDataset("dataset1", sections, InsightDatasetKind.Sections);
					const result2 = await facade.addDataset("dataset2", validSections, InsightDatasetKind.Sections);
					const datasets = await facade.listDatasets();
					// console.log(datasets);
					return expect(datasets).to.deep.equal([
						{id: "dataset1", kind: "sections", numRows: 64612},
						{id: "dataset2", kind: "sections", numRows: 1},
					]);
				});
				it("should resolve after a crash containing previously added datasets", async function () {
					this.timeout(4000);
					const result1 = await facade.addDataset("dataset1", sections, InsightDatasetKind.Sections);
					const result2 = await facade.addDataset("dataset2", validSections, InsightDatasetKind.Sections);
					const datasets = await facade.listDatasets();
					// console.log(datasets);
					let newFacade = new InsightFacade();
					const loadedDatasets = await newFacade.listDatasets();
					return expect(loadedDatasets).to.deep.equal([
						{id: "dataset1", kind: "sections", numRows: 64612},
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
			"./test/resources/queries/ANDtests",

			{
				assertOnResult: async (actual, expected) => {
					// expect(actual).to.have.deep.members(await expected);
					expect(actual).to.have.deep.equals(await expected);
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

import {InsightDatasetKind,} from "./IInsightFacade";
import {DatasetEntry} from "./DatasetEntry";
import SectionsDatasetEntry from "./SectionsDatasetEntry";
import DatasetManager from "./DatasetManager";

export default class ValidateDataset {
	public dataset: DatasetEntry | undefined;

	public validateId(id: string, datasetIds: string[]): boolean {
		/*
		A valid ID is an idstring:
		- An ID that is only whitespace is invalid
		- idString: [^_]+ // one or more of any character, except underscore.
		- Must also be rejected if there is already a dataset containing name.

		RETURNS:
		- True if ID is valid
		- False if ID is invalid
		 */
		let regexp = new RegExp("[^_]+");
		let test = regexp.test(id);

		return test && !datasetIds.includes(id);

	}

	public async validateContent(id: string, content: string, kind: InsightDatasetKind): Promise<boolean> {
		/*
		ASSUME: kind is a valid InsightDatasetKind argument.

		If kind is Rooms:
		- Validate according to RoomsValidation

		if kind is Sections:
		- Validate according to SectionsValidation

		RETURNS:
		- True if the corresponding validation function returns true
		- False otherwise.
		 */
		if (kind === InsightDatasetKind.Sections) {
			let sectionsDataset = new SectionsDatasetEntry();
			try {
				await sectionsDataset.createDatasetEntry(id, content, kind);
				let valid = sectionsDataset.validateDatasetEntry();
				this.setDataset(sectionsDataset);
				return Promise.resolve(valid);
			} catch {
				return Promise.resolve(false);
			}
		} else if (kind === InsightDatasetKind.Rooms) {
			// TODO: Implementation
			return Promise.resolve(false);
		}
		return Promise.resolve(false);
	}

	public setDataset(dataset: DatasetEntry): void {
		this.dataset = dataset;
	}

	public getValidDataset(): DatasetEntry | undefined {
		return this.dataset;
	}

	private validateRoomsDataset(content: string): boolean {
		/*

		 */
		return false;
	}
}

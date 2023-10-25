import {InsightDatasetKind} from "./IInsightFacade";

export interface DatasetEntry {
	id: string;
	numRows: number;
	kind: InsightDatasetKind;
	/*
	Must validate DatasetEntry according to spec.
	 */
	validateDatasetEntry(): boolean;

	/*
	Create datasetEntry.
	 */
	createDatasetEntry(id: string, content: string, kind: InsightDatasetKind): void;


	get_courses(): any;
}

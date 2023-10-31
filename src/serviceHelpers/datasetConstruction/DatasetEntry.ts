import {InsightDataset, InsightDatasetKind} from "../../controller/IInsightFacade";

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

	saveDataset(path: string): void;

	createInsightDataset(): InsightDataset;

	getId(): string;

	getNumRows(): number;

	getKind(): string;

}

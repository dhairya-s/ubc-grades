import SectionEntry from "../datasetConstruction/sectionsDataset/SectionEntry";

export class TransformQuery {
	private collectedQuery: SectionEntry[];
	constructor(collectedQuery: SectionEntry[]) {
		this.collectedQuery = collectedQuery;
	}

	public TransformQuery(transform: object) {
		// handle group
		this.handleGroup(transform["GROUP" as keyof typeof transform]);

	}

	private handleGroup(group: string[]) {
		let groupMap = new Map<string[], SectionEntry[]>();

		for (let section of this.collectedQuery) {

			// for (let keyList of group) {
			// }
			if (groupMap.has(group)) {
				let groupedSections = groupMap.get(group);
				// if (groupedSections === undefined) {
				//
				// }

			}
		}

		// function returnsArray (group: string[], section: SectionEntry) {
		// 	let retArr = [];
		// 	for (let keyList of group) {
		// 		let keyField = keyList.split("_")[1];
		// 		if (keyField === "avg") {
		// 			retArr.push(section.get_avg);
		// 		} else if (keyField === "pass") {
		// 			retArr.push(section.get_pass);
		// 		} else if (keyField === "fail") {
		// 			 retArr.push(section.get_fail);
		// 		} else if (keyField === "audit") {
		// 			 retArr.push(section.get_audit);
		// 		} else if (keyField === "year") {
		// 			 retArr.push(section.get_year);
		// 		} else if (keyField === "dept") {
		// 			 retArr.push(section.get_dept);
		// 		} else if (keyField === "id") {
		// 			 retArr.push(section.get_id);
		// 		} else if (keyField === "instructor") {
		// 			 retArr.push(section.get_instructor);
		// 		} else if (keyField === "title") {
		// 			 retArr.push(section.get_title);
		// 		} else if (keyField === "uuid") {
		// 			 retArr.push(String(section.get_uuid));
		// 		}
		// 	}
		// 	return retArr;
		//
		// }

	}

	private handleApply() {

	}

}

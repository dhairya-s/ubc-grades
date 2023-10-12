import * as fs from "fs-extra";

const persistDir = "./test/resources/saved_data/";

/**
 * Convert a file into a base64 string.
 *
 * @param name  The name of the file to be converted.
 *
 * @return Promise A base 64 representation of the file
 */
const getContentFromArchives = (name: string): string =>
	fs.readFileSync("test/resources/archives/" + name).toString("base64");

/**
 * Removes all files within the persistDir.
 */
function clearDisk(): void {
	let dirFiles = fs.readdirSync(persistDir);
	dirFiles = dirFiles.filter(function(value) {
		return value !== ".gitkeep";
	});
	for (const file of dirFiles) {
		console.log(persistDir + file);
		fs.removeSync(persistDir + file);
	}
}

export {getContentFromArchives, clearDisk};

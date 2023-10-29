import * as fs from "fs-extra";

const persistDir = "./data";

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
	let persistDirMod = persistDir + "/";
	if (fs.existsSync(persistDirMod)) {
		let dirFiles = fs.readdirSync(persistDirMod);
		dirFiles = dirFiles.filter(function(value) {
			return value !== ".gitkeep";
		});
		for (const file of dirFiles) {
			// console.log(persistDir + file);
			fs.removeSync(persistDirMod + file);
		}
		fs.removeSync(persistDirMod);
	}
	// let dirFiles = fs.readdirSync(persistDirMod);
	// dirFiles = dirFiles.filter(function(value) {
	// 	return value !== ".gitkeep";
	// });
	// for (const file of dirFiles) {
	// 	// console.log(persistDir + file);
	// 	fs.removeSync(persistDirMod + file);
	// }
}

export {getContentFromArchives, clearDisk};

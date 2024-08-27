import { mkdirSync, existsSync } from 'fs';
import { extract } from 'zip-lib';
import { join } from 'path';

const temp = join('.', 'temp');

const outputFile = join(temp, 'merged_output.zip'); // Path for the merged output file

async function extractZip(zipFilePath, outputDir) {
	if (!existsSync(outputDir)) {
		mkdirSync(outputDir);
	}
	try {
		await extract(zipFilePath, outputDir);
		console.log('Extract Successful');
	} catch (error) {
		console.error(error);
	}
}

await extractZip(outputFile, join('.', 'output'));

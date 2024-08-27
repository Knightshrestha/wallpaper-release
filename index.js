import {
	mkdirSync,
	createWriteStream,
	readdirSync,
	createReadStream,
	existsSync,
} from 'fs';
import { join } from 'path';
import { extract } from 'zip-lib';

const temp = join('.', 'temp');
if (!existsSync(temp)) {
	mkdirSync(temp);
}

async function mergeFiles(chunksDir, outputFile) {
	const output = createWriteStream(outputFile);

	// Read the chunk files in order
	const chunkFiles = readdirSync(chunksDir);

	// Sort files by chunk index (assuming they are named `chunk_0.bin`, `chunk_1.bin`, etc.)
	const sortedChunkFiles = chunkFiles.sort((a, b) => {
		const getIndex = (filename) =>
			Number(filename.match(/chunk_(\d+)\.bin/)[1]);
		return getIndex(a) - getIndex(b);
	});

	// Append each chunk to the output file
	for (const chunkFile of sortedChunkFiles) {
		const chunkFilePath = join(chunksDir, chunkFile);
		await appendChunk(chunkFilePath, output);
	}

	output.end(() => {
		console.log(`Merging completed: ${outputFile}`);
	});
}

async function appendChunk(chunkFilePath, output) {
	return new Promise((resolve, reject) => {
		const chunkStream = createReadStream(chunkFilePath);

		chunkStream.on('data', (chunk) => {
			output.write(chunk);
		});

		chunkStream.on('end', resolve);
		chunkStream.on('error', reject);
	});
}

async function extractZip(zipFilePath, outputDir) {
	try {
		await extract(zipFilePath, outputDir);
		console.log('Extract Successful');
	} catch (error) {
		console.error(error);
	}
}

const chunksDir = join('.', 'final'); // Directory where the chunks are stored
const outputFile = join(temp, 'merged_output.zip'); // Path for the merged output file

mergeFiles(chunksDir, outputFile)
	.then(async () => {
		await extractZip(outputFile, join('.'));
	})

	.catch((err) => console.error('Error merging files:', err));

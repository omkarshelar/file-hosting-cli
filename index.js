#!/usr/bin/env node

const fs = require('fs');
const mime = require('mime');
const { program } = require('commander');

program.version('1.0.0');

program
	.requiredOption('-f, --file <path-to-file>', 'Expiry time of the object in minutes')
	.option('-e, --expire <expire-minutes>', 'Expiry time of the object in minutes. Default is 5 minutes. Minimum 5 minutes', 5);

program.on('--help', () => {
	console.log('');
	console.log('Example call:');
	console.log('$ fha -f hello.txt');
	console.log('$ fha -f hello.txt -e 30');
});

if (process.argv.length === 2) {
	program.outputHelp();
	process.exit(0);
}

program.parse(process.argv);

if (program.expire < 5) {
	console.error("Expiry of objects should be more than 5 minutes");
}

const axios = require('axios').default;
const baseURL = "https://fha.omkarshelar.dev"
let binaryFile;
try {
	binaryFile = fs.readFileSync(program.file);
} catch {
	console.error(`Error: File named ${program.file} NOT found.`);
	process.exit(1);
}

fileName = program.file.slice(program.file.lastIndexOf("/") + 1);

if (!process.env.FH_API_KEY) {
	console.log("API KEY not in environment variables. Please provide API KEY.");
	process.exit(1);
}
const baseHeaders = {
	"x-api-key": process.env.FH_API_KEY
};

axios.get(`${baseURL}/signed-url-upload/${fileName}`, {
	headers: {
		...baseHeaders
	}
}).then(res => {
	const uploadURL = res.data.UploadURL
	const objectKey = res.data.Key

	contentType = mime.getType(fileName.slice(fileName.lastIndexOf(".") + 1));
	axios.put(uploadURL, binaryFile, {
		headers: {
			...baseHeaders,
			'Content-Type': contentType
		}
	}).then(res => {
		if (res.status === 200) {
			const expiryTime = Math.floor(new Date().getTime() / 1000) + 60 * program.expire;
			axios.post(`${baseURL}/custom-uri/${objectKey}/${expiryTime}`, {}, {
				headers: {
					...baseHeaders
				}
			})
				.then(res => {
					console.log(`Download URL: ${baseURL}/asset/${res.data.URL}`);
					const options = {
						weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZoneName: 'long', hour: 'numeric',
						minute: 'numeric',
						second: 'numeric'
					};
					console.log(`URL Expiry : ${new Date(expiryTime * 1000).toLocaleString('en-US', options)}`)
				})
				.catch(err => console.error(err));
		}
	});
});


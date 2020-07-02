#!/usr/bin/env node
const utils = require("./utils");
const fs = require("fs");
const mime = require("mime");
const { program } = require("commander");

program.version("1.2.0");

program.requiredOption(
	"-f, --file <path-to-file>",
	"Expiry time of the object in minutes"
)
	.option(
		"-e, --expire <expire-minutes>",
		"Expiry time of the object in minutes. Minimum 5 minutes",
		5
	)
	.option("-p, --password", "To password protect your file.");

program.on("--help", () => {
	console.log("Example call:");
	console.log("$ fha -f hello.txt");
	console.log("$ fha -f hello.txt -e 30");
	console.log("$ fha -f hello.txt -e 30 -p");
});

// If no arguments more arguments sent to application, display help.
if (process.argv.length === 2) {
	program.outputHelp();
	process.exit(0);
}
program.parse(process.argv);

// Check minimum time
if (program.expire < 5) {
	console.error("Expiry of objects should be more than 5 minutes");
}

// Ask for password
if (program.password) {
	utils.askPassword().then(password => {
		console.log("\n");
		uploadFile(password);
	});
}
else {
	uploadFile();
}

function uploadFile(password = null) {
	const axios = require("axios").default;
	const baseURL = "https://fha.omkarshelar.dev";
	let binaryFile;
	try {
		binaryFile = fs.readFileSync(program.file);
	} catch {
		console.error(`Error: File named ${program.file} NOT found.`);
		process.exit(1);
	}

	fileName = program.file.slice(program.file.lastIndexOf("/") + 1);

	if (!process.env.FH_API_KEY) {
		console.log(
			"API KEY not in environment variables. Please provide API KEY."
		);
		process.exit(1);
	}

	// API key needed to authenticate
	const baseHeaders = {
		"x-api-key": process.env.FH_API_KEY
	};

	// Make requests to the API and S3
	axios.get(`${baseURL}/signed-url-upload/${fileName}`, {
		headers: {
			...baseHeaders
		}
	}).then(res => {
		const uploadURL = res.data.UploadURL;
		const objectKey = res.data.Key;
		// Calculate mime/type of the file
		contentType = mime.getType(
			fileName.slice(fileName.lastIndexOf(".") + 1)
		);
		axios.put(uploadURL, binaryFile, {
			headers: {
				"Content-Type": contentType
			}
		}).then(res => {
			if (res.status === 200) {
				const expiryTime =
					Math.floor(
						new Date().getTime() / 1000
					) +
					60 * program.expire;
				let customURIData = {};
				if (password) {
					customURIData.password = password;
				}
				axios.post(
					`${baseURL}/custom-uri/${objectKey}/${expiryTime}`,
					customURIData,
					{
						headers: {
							...baseHeaders
						}
					}
				)
					.then(res => {
						console.log(
							`Download URL: ${baseURL}/asset/${res.data.URL}`
						);
						const options = {
							weekday: "long",
							year: "numeric",
							month: "long",
							day: "numeric",
							timeZoneName: "long",
							hour: "numeric",
							minute: "numeric",
							second: "numeric"
						};
						console.log(
							`URL Expiry : ${new Date(
								expiryTime *
								1000
							).toLocaleString(
								"en-US",
								options
							)}`
						);
					})
					.catch(err => console.error(err));
			}
		});
	});
}

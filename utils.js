var readline = require("readline");
var Writable = require("stream").Writable;

function askPassword() {
	var mutableStdout = new Writable({
		write: function (chunk, encoding, callback) {
			if (!this.muted) process.stdout.write(chunk, encoding);
			callback();
		}
	});

	mutableStdout.muted = false;

	var rl = readline.createInterface({
		input: process.stdin,
		output: mutableStdout,
		terminal: true
	});

	let pass = new Promise((resolve, reject) => {
		rl.question("Enter Password: ", function (password) {
			rl.close();
			resolve(password);
		});
	});
	mutableStdout.muted = true;
	return pass;


}

module.exports.askPassword = askPassword;

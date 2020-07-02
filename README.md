# file-hosting-cli
CLI application for temporary file hosting.


**Application URL :** https://filehosting.omkarshelar.dev/

**Frontend Code :** https://github.com/omkarshelar/file-hosting-frontend

**Backend Code :** https://github.com/omkarshelar/file-hosting-backend

**CLI Code :** https://github.com/omkarshelar/file-hosting-cli (This Repo)

Ephermal hosting for files. Upload files, get URL of the uploaded file. Share the URl with others!

CLI application to automate file uploads. Can be used on the server or to automate file uploads using shell scripts.

### Demo
[![asciicast](https://asciinema.org/a/344592.svg)](https://asciinema.org/a/344592)

You can run the application by running
```
npm install -g fha
```
OR if you are using npm version > `5.2.0` you can use
```
npx fha
```

```
Usage:  [options]

Options:
  -V, --version                  output the version number
  -f, --file <path-to-file>      Expiry time of the object in minutes
  -e, --expire <expire-minutes>  Expiry time of the object in minutes. Minimum
                                 5 minutes (default: 5)
  -p, --password                 To password protect your file.
  -h, --help                     display help for command
Example call:
$ fha -f hello.txt
$ fha -f hello.txt -e 30
$ fha -f hello.txt -e 30 -p
```

The application needs an API Key to function to prevent misuse and keep hosting costs low, you can [contact me](https://omkarshelar.dev) for setting you own instance of the applcation using your own account

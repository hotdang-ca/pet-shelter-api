# Pet Shelter API
## Introduction
The Pet Shelter API is a sample ExpressJS project wrapped into a NodeJS project which facilitates the management of a list of pets and their current location.

## Getting Started
The project currently relies on a Postgres Datastore, and uses the default system connection. Be sure to update the connection string at app.js:6.
After first assuring your NodeJS set up is up-to-date, you can perform the following commands to get the system up and running:
`npm install`
`node app.js`

## Endpoints
The project describes a variety of REST activities at the following endpoints:

`GET /`	- root, nothing for now

`GET /breeds`	- get a list of breeds the platform currently supports

`GET /types`	- get a list of pet types the platform currently supports

`GET /pets`	- get a list of pets and their information

`POST /pets`	- create a new pet. Requires the following JSON body:
```
{
	"name": "", // name of the pet
	"type_id": 1, // the ID of the type of pet this is
	"breed_id": 1, // the ID of the breed of pet this is
	"location": "", // the descriptive name for the pet’s current location
	"latitude": 123.456, // the latitude coordinate for the pet’s current location
	"longitude": 654.321 // the longitude coordinate for the pet’s current location
}
```

## TODO
* -Restore JOINS in the database commands; the SQLite driver used a previous revision did not support the cross-reference of column data for LEFT or INNER joins. Now that the system relies on Postgres, this may have changed.- This is actually done.
* Use better ExpressJS development patterns. I literally learned ExpressJS over the course of a few hours; this is the result.
* Use better local environment variables; there is a placeholder .ENV file for which to set these; it didn’t seem too important at the time.
* Investigate why the Heroku instance keeps stalling from time to time, requiring a Dynos Restart.

## License
Copyright 2017 James Robert Perih

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

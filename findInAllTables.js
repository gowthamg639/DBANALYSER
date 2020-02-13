"use strict";

const pg = require("pg");

const databaseName = 'sasdb_8827';
const schemaName = 'db43749db';

const dbConfig = {
	user: 'root',
	database: databaseName,
	password: '',
	port: 5432
};

const pool = new pg.Pool(dbConfig);
const args = process.argv;
const searchVal = args[2];
const stopAtFirstAppearence = true;

const execute = (command, callback) => {
	pool.connect(function(err, client, done) {
		if (err) {
			// console.error("Error :",err);
		} else {
			client.query(`SET search_path TO ${schemaName}`, function(err, res) { // Need to set your search path here
				client.query(command, function(err, result) {
					done();
					if (err) {
						// console.error("Error :",err);
					} else {
						callback(result.rows);
					}
				})
			})
		}
	})
}

const getAllTalesQuery = `SELECT table_name FROM information_schema.tables WHERE table_schema='${schemaName}' AND table_type='BASE TABLE';`;

const allTablesCallBack = resp => {
	console.log(`Search results for ${searchVal}`);
	resp.forEach(table => {
		let tableQry = `SELECT * from ${table.table_name};`;
		let callback = tableVal => {
			tableVal.every(eachRow => {
				let returnVal = true;
				for (let key in eachRow) {
					let value = eachRow[key];
					value = value ? value + "" : "";
					if (value.indexOf(searchVal) != -1) {
					// if (value == searchVal) {
						console.log(table.table_name, " : ", key);
						returnVal = false;
					}
				}
				return stopAtFirstAppearence ? returnVal : true;
			})
		};
		execute(tableQry, callback);
	});
}

execute(getAllTalesQuery, allTablesCallBack);





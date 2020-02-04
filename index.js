const hapi = require('@hapi/hapi');
const pgp = require('pg-promise')();

const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;
const DB_USER = process.env.DB_USER;
const DB_NAME = process.env.DB_NAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const SERVER_PORT = process.env.SERVER_PORT;
const SERVER_ENDPOINT = process.env.SERVER_ENDPOINT;

let connection;

const init = async () => {
	console.log(`Attempting DB connection to database ${DB_NAME} at ${DB_HOST}:${DB_PORT} with user ${DB_USER}.`);
	/* const connectionOptions = {
		host: DB_HOST, // 'localhost' is the default;
		port: DB_PORT, // 5432 is the default;
		database: DB_NAME,
		user: DB_USER,
		password: DB_PASSWORD,
	}; */
	const connectionString = `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
	connection = pgp(connectionString);
    const server = hapi.server({
        port: SERVER_PORT,
        host: 'localhost'
    });
    server.route({
        method: 'GET',
        path: SERVER_ENDPOINT,
        handler: async (request, h) => {
			console.log('Getting request');
			const result = await connection.any('select * FROM testRecords;')
										   .then(data => {
												return Object.stringify(data);
										   })
									       .catch(err => {
												return `Error ${err}`;
										   });
            return result;
        }
    });
	
    await server.start();
    console.log('Server running on %s', server.info.uri);
};

console.log(`Attempted server start at ${SERVER_ENDPOINT}:${SERVER_PORT}.`);
try {
  init();
} catch (e) {
  console.log(e);
}
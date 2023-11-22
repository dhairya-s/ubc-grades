import express, {Application, Request, Response} from "express";
import * as http from "http";
import cors from "cors";
import InsightFacade from "../controller/InsightFacade";
import {InsightDatasetKind, InsightError, NotFoundError} from "../controller/IInsightFacade";

export default class Server {
	private readonly port: number;
	private express: Application;
	private server: http.Server | undefined;

	constructor(port: number) {
		console.info(`Server::<init>( ${port} )`);
		this.port = port;
		this.express = express();

		this.registerMiddleware();
		this.registerRoutes();

		// NOTE: you can serve static frontend files in from your express server
		// by uncommenting the line below. This makes files in ./frontend/public
		// accessible at http://localhost:<port>/
		// this.express.use(express.static("./frontend/public"))
	}

	/**
	 * Starts the server. Returns a promise that resolves if success. Promises are used
	 * here because starting the server takes some time and we want to know when it
	 * is done (and if it worked).
	 *
	 * @returns {Promise<void>}
	 */
	public start(): Promise<void> {
		return new Promise((resolve, reject) => {
			console.info("Server::start() - start");
			if (this.server !== undefined) {
				console.error("Server::start() - server already listening");
				reject();
			} else {
				this.server = this.express
					.listen(this.port, () => {
						console.info(`Server::start() - server listening on port: ${this.port}`);
						resolve();
					})
					.on("error", (err: Error) => {
						// catches errors in server start
						console.error(`Server::start() - server ERROR: ${err.message}`);
						reject(err);
					});
			}
		});
	}

	/**
	 * Stops the server. Again returns a promise so we know when the connections have
	 * actually been fully closed and the port has been released.
	 *
	 * @returns {Promise<void>}
	 */
	public stop(): Promise<void> {
		console.info("Server::stop()");
		return new Promise((resolve, reject) => {
			if (this.server === undefined) {
				console.error("Server::stop() - ERROR: server not started");
				reject();
			} else {
				this.server.close(() => {
					console.info("Server::stop() - server closed");
					resolve();
				});
			}
		});
	}

	// Registers middleware to parse request before passing them to request handlers
	private registerMiddleware() {
		// JSON parser must be place before raw parser because of wildcard matching done by raw parser below
		this.express.use(express.json());
		this.express.use(express.raw({type: "application/*", limit: "10mb"}));

		// enable cors in request headers to allow cross-origin HTTP requests
		this.express.use(cors());
	}

	private async getOperation(req: any, res: any) {
		let facade = new InsightFacade();
		try {
			let result = await facade.listDatasets();
			res.status(200);
			res.send({result: result});
		} catch (error) {
			console.log("Error on get");
		}
	}

	private async postOperation(req: any, res: any) {
		let facade = new InsightFacade();
		let query = req.body;
		try {
			let result = await facade.performQuery(query);
			res.status(200);
			res.send({result: result});
		} catch (error) {
			res.status(400);
			if (error instanceof InsightError) {
				res.send({error: error.message});
			}
		}
	}

	private async putOperation(req: any, res: any) {
		let facade = new InsightFacade();
		const params = req.params;
		let id = params.id.toString();
		let kindQuery = params.kind.toString();
		let kind = InsightDatasetKind.Sections;
		if (kindQuery === InsightDatasetKind.Rooms) {
			kind = InsightDatasetKind.Rooms;
		}
		let content = req.body.toString("base64");
		try {
			let result = await facade.addDataset(id, content, kind);
			res.status(200);
			res.send({result: result});
			return Promise.resolve();
		} catch (error) {
			res.status(400);
			if (error instanceof InsightError) {
				res.send({error: error.message});
			}
			return Promise.resolve();
		}
	}

	private async deleteOperation(req: any, res: any) {
		let facade = new InsightFacade();
		const params = req.params;
		let id = params.id.toString();
		console.log(id);
		try {
			let result = await facade.removeDataset(id);
			res.status(200);
			res.send({result: result});
			return Promise.resolve();
		} catch (error) {
			if (error instanceof InsightError) {
				res.status(400);
				res.send({error: error.message});
			}
			if (error instanceof NotFoundError) {
				res.status(404);
				res.send({error: error.message});
			}
			return Promise.resolve();
		}
	}

	// Registers all request handlers to routes
	private registerRoutes() {
		// This is an example endpoint this you can invoke by accessing this URL in your browser:
		// http://localhost:4321/echo/hello
		this.express.get("/echo/:msg", Server.echo);
		// list dataset
		// this.express.get("/datasets", () => this.getOperation(res, req));

		this.express.get("/datasets", (req, res) => {
			this.getOperation(req, res);
			// return Promise.resolve();
		});
		// perform query
		this.express.post("/query", async (req, res) => {
			if (req.body) {
				await this.postOperation(req, res);
			}
			return Promise.resolve();
		});

		// Add dataset
		this.express.put("/dataset/:id?/:kind", async (req, res) => {
			if (req.params.id && req.params.kind) {
				await this.putOperation(req, res);
			} else {
				res.status(400);
				res.send({error: "Invalid parameters."});
			}
			// await this.putOperation(req, res);

			return Promise.resolve();
		});

		// Delete dataset
		this.express.delete("/dataset/:id?", async (req, res) => {
			if (req.params.id) {
				await this.deleteOperation(req, res);
			} else {
				res.status(400);
				res.send({error: "Invalid parameters."});
			}
			return Promise.resolve();
		});
	}

	// The next two methods handle the echo service.
	// These are almost certainly not the best place to put these, but are here for your reference.
	// By updating the Server.echo function pointer above, these methods can be easily moved.
	private static echo(req: Request, res: Response) {
		try {
			console.log(`Server::echo(..) - params: ${JSON.stringify(req.params)}`);
			const response = Server.performEcho(req.params.msg);
			res.status(200).json({result: response});
		} catch (err) {
			res.status(400).json({error: err});
		}
	}

	private static performEcho(msg: string): string {
		if (typeof msg !== "undefined" && msg !== null) {
			return `${msg}...${msg}`;
		} else {
			return "Message not provided";
		}
	}
}

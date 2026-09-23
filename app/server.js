const express = require("express");
const client = require("@prometheus-io/client");

const app = express();

client.collectDefaultMetrics();

const requestCounter = new client.Counter({
	name: "app_http_requests_total",
	help: "Total number of HTTP requests",
	labelNames: ["method", "route", "status_code"],
});

const requestDuration = new client.Histogram({
	name: "app_http_request_duration_seconds",
	help: "HTTP request duration in seconds",
	labelNames: ["method", "route", "status_code"],
});

const healthCheckCounter = new client.Counter({
	name: "app_health_checks_total",
	help: "Total number of health checks",
});

app.use((req, res, next) => {
	const end = requestDuration.startTimer({
		method: req.method,
	});

	res.on("finish", () => {
		requestCounter.inc({
			method: req.method,
			route: req.path,
			status_code: res.statusCode.toString(),
		});

		end({
			route: req.path,
			status_code: res.statusCode.toString(),
		});
	});

	next();
});

app.get("/", (req, res) => {
	res.send("Sherlock Logs");
});

app.get("/health", (req, res) => {
	healthCheckCounter.inc();

	res.json({
		status: "ok",
	});
});

app.get("/metrics", async (req, res) => {
	res.set("Content-Type", client.register.contentType);
	res.end(await client.register.metrics());
});

app.listen(3000, "0.0.0.0", () => {
	console.log("App listening on port 3000");
});

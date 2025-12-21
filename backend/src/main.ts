import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { ValidationPipe } from "@nestjs/common";
import { json, urlencoded } from "express";
import * as path from "node:path";
import * as fs from "node:fs";

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		cors: {
			origin: true,
			credentials: true,
			methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
			allowedHeaders: ["Content-Type", "Authorization"],
		},
	});

	app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

	app.setGlobalPrefix("api");

	const storageDir =
		process.env.STORAGE_DIR || path.resolve(process.cwd(), "storage");
	const uploadsDir = path.join(storageDir, "uploads");
	const sessionsDir = path.join(storageDir, "sessions");
	[storageDir, uploadsDir, sessionsDir].forEach((dir) => {
		if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
	});

	app.use(json({ limit: "16mb" }));
	app.use(urlencoded({ extended: true, limit: "16mb" }));

	const port = Number(process.env.PORT) || 3000;
	await app.listen(port);
	// eslint-disable-next-line no-console
	console.log(`API running on http://localhost:${port}`);
}

bootstrap().catch((err) => {
	// eslint-disable-next-line no-console
	console.error("Fatal bootstrap error:", err);
	process.exit(1);
});

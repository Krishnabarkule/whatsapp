const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const waitOn = require("wait-on");

let backend;

function startBackend() {
	const backendDist = path.resolve(__dirname, "../backend/dist/main.js");
	backend = spawn(process.execPath, [backendDist], { stdio: "inherit" });
}

function createWindow() {
	const win = new BrowserWindow({
		width: 1200,
		height: 800,
		webPreferences: { nodeIntegration: false, contextIsolation: true },
	});
	const url = "http://localhost:5173";
	win.loadURL(url);
}

app.whenReady().then(async () => {
	startBackend();
	await waitOn({
		resources: ["http-get://localhost:3000/api/analytics/summary"],
		timeout: 20000,
	}).catch(() => {});
	createWindow();

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});

app.on("quit", () => {
	if (backend) backend.kill("SIGINT");
});

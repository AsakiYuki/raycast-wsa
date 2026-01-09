import { exec } from "child_process"
import { isRunning, isRunningSync } from "./wsa"
import { promisify } from "util"

const execAsync = promisify(exec)

export async function isInstalled() {
	try {
		await execAsync("adb --version")
		return true
	} catch (error) {
		return false
	}
}

export enum ConnectState {
	CONNECTING,
	CONNECTED,
	NOT_CONNECTED,
	ADB_NOT_INSTALLED,
	WSA_NOT_RUNNING,
}

export async function connect(port: number = 58526) {
	try {
		if (!(await isRunning())) return ConnectState.WSA_NOT_RUNNING
		return execAsync(`adb connect 127.0.0.1:${port}`, { encoding: "utf-8" }).then(res =>
			res.stdout.startsWith(`cannot connect to 127.0.0.1:${port}`)
				? ConnectState.NOT_CONNECTED
				: ConnectState.CONNECTED
		)
	} catch (error) {
		console.error(error)
		return ConnectState.ADB_NOT_INSTALLED
	}
}

export async function listApplications() {
	try {
	} catch (error) {
		console.error(error)
		return null
	}
}

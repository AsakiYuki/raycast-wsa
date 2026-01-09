import { runPowerShellScript } from "@raycast/utils"
import { execSync } from "child_process"
import fs from "fs"

export function isWsaInstalled() {
	const wsaPath =
		process.env.HOME + "\\AppData\\Local\\Packages\\MicrosoftCorporationII.WindowsSubsystemForAndroid_8wekyb3d8bbwe"

	return fs.existsSync(wsaPath)
}

export async function isRunning() {
	try {
		await runPowerShellScript("Get-Process -Name WsaClient")
		return true
	} catch (e) {
		return false
	}
}

export function isRunningSync() {
	try {
		execSync("Get-Process -Name WsaClient", {
			shell: "powershell.exe",
		})
		return true
	} catch (error) {
		return false
	}
}

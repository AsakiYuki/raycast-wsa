import { runPowerShellScript } from "@raycast/utils"
import { execSync, exec } from "child_process"
import { promisify } from "util"
import fs from "fs"

const execAsync = promisify(exec)

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

export interface PackageRegistryInfo {
	id: string
	icon: string
	name: string
	author: string
	version: string
}

export async function getPackageList() {
	try {
		const info = await execAsync(
			'reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall" /s | findstr /i "AndroidPackageName DisplayName DisplayIcon Publisher DisplayVersion HKEY_"'.trim()
		).then(({ stdout }) => stdout.split(/\r?\n/))

		const values: PackageRegistryInfo[] = []
		for (let index = 0; index < info.length; index++) {
			const v: Record<string, { type: string; data: string }> = {}

			for (let $index = index + 1; index < info.length; $index++) {
				const $ = info[$index]

				if ($ === undefined) break
				if ($.startsWith("HKEY_")) {
					index = $index - 1
					break
				}

				const [name, type, value] = $?.trim().split(/\s{2,}|\t+/)
				v[name] = { type, data: value }
			}

			if (v.AndroidPackageName) {
				values.push({
					id: v.AndroidPackageName.data,
					author: v.Publisher.data,
					name: v.DisplayName.data,
					version: v.DisplayVersion.data,
					icon: v.DisplayIcon.data,
				})
			}
		}

		return values
	} catch (error) {
		console.error(error)
		return []
	}
}

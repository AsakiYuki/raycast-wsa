import { exec } from "child_process"
import { isRunning } from "./wsa"
import { promisify } from "util"
import { LocalStorage } from "@raycast/api"

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

export enum PackagesFilter {
	ALL = "",
	DISABLE = "-d",
	ENABLE = "-e",
	THIRD_PARTY = "-3",
	SYSTEM = "-s",
}

export interface AppInfo {
	Id: string
	DisplayName?: string
	DisplayIcon?: string
	Publisher?: string
}

export async function getPackageRegistryInfos(packageId: string): Promise<AppInfo | null> {
	if (/^(\w|\.)+$/.test(packageId)) {
		try {
			const value = await LocalStorage.getItem(`wsa-${packageId}`)
			if (value && typeof value === "string") return JSON.parse(value)

			const result = await execAsync(
				"reg query HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\" + packageId
			).then(res => res.stdout)

			const info: AppInfo = {
				Id: packageId,
			}

			result
				.split("\n")
				.slice(1)
				.forEach(value => {
					const [$1, , $3] = value.trim().split("    ")
					if (["DisplayName", "DisplayIcon", "Publisher"].includes($1)) info[$1 as keyof typeof info] = $3
				})

			await LocalStorage.setItem(`wsa-${packageId}`, JSON.stringify(info))

			return info
		} catch (error) {
			await LocalStorage.setItem(`wsa-${packageId}`, JSON.stringify({ Id: packageId }))
			return {
				Id: packageId,
			}
		}
	} else return null
}

export async function listPackages(filter: PackagesFilter = PackagesFilter.ALL) {
	try {
		if (!(await isRunning())) return null

		return (await Promise.all(
			await execAsync("adb shell pm list packages " + filter, { encoding: "utf-8" }).then(res =>
				(res.stdout.match(/(\w|\.)+$/gm) || []).map(getPackageRegistryInfos)
			)
		)) as AppInfo[]
	} catch (error) {
		return null
	}
}

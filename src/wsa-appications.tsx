import { Action, ActionPanel, Detail, List, showHUD, showToast, Toast } from "@raycast/api"
import { useState } from "react"
import { PackagesFilter, ConnectState, connect, listPackages, AppInfo } from "./helper/adb"
import { runPowerShellScript, usePromise } from "@raycast/utils"
import { safeSearchRegex } from "./helper/searchRegex"

export default function Command() {
	const [connected, setConnected] = useState<ConnectState>(ConnectState.CONNECTING)
	const [list, setList] = useState<Array<AppInfo>>([])
	const [search, setSearch] = useState("")

	usePromise(async () => {
		showToast(Toast.Style.Animated, "Connecting to WSA...")
		setConnected(await connect())
		await showToast(Toast.Style.Animated, "Loading applications...")
		setList(
			(await listPackages(PackagesFilter.ALL))?.filter(
				app => app.DisplayName && app.DisplayIcon && app.Publisher
			) || []
		)
		const toast = await showToast(Toast.Style.Success, "Applications loaded")
		setTimeout(() => toast.hide(), 5000)
	})

	const searchRefex = safeSearchRegex(search)

	return connected === ConnectState.CONNECTING ? (
		<Detail navigationTitle="Windows Subsystem for Android" markdown="Connecting to WSA..." />
	) : connected === ConnectState.NOT_CONNECTED ? (
		<Detail navigationTitle="Windows Subsystem for Android" markdown="Cannot connect to WSA" />
	) : connected === ConnectState.ADB_NOT_INSTALLED ? (
		<Detail navigationTitle="Windows Subsystem for Android" markdown="ADB is not installed" />
	) : connected === ConnectState.WSA_NOT_RUNNING ? (
		<Detail navigationTitle="Windows Subsystem for Android" markdown="WSA is not running" />
	) : (
		<List
			navigationTitle="Windows Subsystem for Android"
			searchBarPlaceholder="Search Applications..."
			onSearchTextChange={setSearch}
		>
			{list.sort().map(({ Id, DisplayIcon, DisplayName, Publisher }) =>
				searchRefex.test(DisplayName || "") ? (
					<List.Item
						key={Id}
						title={DisplayName || Id}
						subtitle={DisplayName ? Id : undefined}
						icon={DisplayIcon}
						accessories={[{ text: Publisher }]}
						actions={
							<ActionPanel title="Windows Subsystem for Android">
								<Action
									title="Launch"
									onAction={async () => {
										await showHUD(`Launching ${DisplayName || Id}...`)
										await runPowerShellScript(`WsaClient.exe /launch wsa://${Id}`)
									}}
								/>
								<Action
									title="Uninstall"
									shortcut={{ modifiers: ["ctrl"], key: "d" }}
									onAction={() => {}}
								/>
								<Action
									title="Appication Info"
									shortcut={{ modifiers: ["ctrl"], key: "f" }}
									onAction={() => {}}
								/>
							</ActionPanel>
						}
					/>
				) : null
			)}
		</List>
	)
}

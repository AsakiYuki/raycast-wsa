import { Action, ActionPanel, Detail, List, showHUD, showToast, Toast } from "@raycast/api"
import { useState } from "react"
import { PackagesFilter, ConnectState, connect, listPackages, AppInfo } from "./helper/adb"
import { runPowerShellScript, usePromise } from "@raycast/utils"

export default function Command() {
	const [connected, setConnected] = useState<ConnectState>(ConnectState.CONNECTING)
	const [appLoaded, setAppLoaded] = useState(false)
	const [list, setList] = useState<Array<AppInfo>>([])
	const [search, setSearch] = useState("")

	usePromise(async () => {
		showToast(Toast.Style.Animated, "Connecting to WSA...")
		setConnected(await connect())
		showToast(Toast.Style.Animated, "Loading applications...")
		setList((await listPackages(PackagesFilter.ALL)) || [])
		showToast(Toast.Style.Success, "Applications loaded")
	})

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
			{list.map(({ Id, DisplayIcon, DisplayName }) => (
				<List.Item
					key={Id}
					title={DisplayName || Id}
					subtitle={DisplayName ? Id : undefined}
					icon={DisplayIcon}
					actions={
						<ActionPanel title="Windows Subsystem for Android">
							<Action
								title="Launch"
								onAction={async () => {
									await showHUD(`Launching ${DisplayName || Id}...`)
									await runPowerShellScript(`WsaClient.exe /launch wsa://${Id}`)
								}}
							/>
						</ActionPanel>
					}
				/>
			))}
		</List>
	)
}

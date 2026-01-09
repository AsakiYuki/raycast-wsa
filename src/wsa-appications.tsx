import { Detail, List, popToRoot, showToast, Toast } from "@raycast/api"
import { useState } from "react"
import { ConnectState, connect } from "./helper/adb"
import { usePromise } from "@raycast/utils"

export default function Command() {
	const [connected, setConnected] = useState<ConnectState>(ConnectState.CONNECTING)
	const [search, setSearch] = useState("")

	usePromise(async () => {
		setConnected(await connect())
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
		></List>
	)
}

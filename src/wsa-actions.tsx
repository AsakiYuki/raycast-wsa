"use client"

import { useState } from "react"
import { Action, ActionPanel, Detail, List, showHUD } from "@raycast/api"
import { WsaPowerControl } from "./components/WsaControl"
import { runPowerShellScript } from "@raycast/utils"
import { safeSearchRegex } from "./helper/searchRegex"

export default function Command() {
	const [search, setSearch] = useState("")
	const [isRunning, setIsRunning] = useState<boolean | null>(null)

	const searchRegex = safeSearchRegex(search)

	const list: Array<{
		title: string
		icon: string
		actions: () => void
	}> = [
		{
			title: "Android Settings",
			icon: "settings.ico",
			actions: () => {
				runPowerShellScript("WsaClient.exe /launch wsa://com.android.settings").then(() =>
					showHUD("System Settings has been opened")
				)
			},
		},
		{
			title: "WSA Settings",
			icon: "extension-icon.png",
			actions: () => {
				runPowerShellScript('Start-Process "wsa-settings://"').then(() =>
					showHUD("WSA Settings has been opened")
				)
			},
		},
		{
			title: "Android Files",
			icon: "folder.ico",
			actions: () => {
				runPowerShellScript("WsaClient.exe /launch wsa://com.android.documentsui").then(() =>
					showHUD("Files has been opened")
				)
			},
		},
	].filter(({ title }) => searchRegex.test(title))

	return (
		<List
			filtering={false}
			onSearchTextChange={setSearch}
			navigationTitle="Windows Subsystem for Android Actions"
			searchBarPlaceholder="Search..."
		>
			<WsaPowerControl onStateChange={setIsRunning} search={searchRegex} />
			{isRunning === null
				? null
				: list.map(({ actions, title, icon }) => (
						<List.Item
							key={title}
							title={title}
							icon={icon}
							actions={
								<ActionPanel title="Windows Subsystem for Android">
									<Action title="Actions" onAction={actions} />
								</ActionPanel>
							}
						/>
					))}
		</List>
	)
}

import { Action, ActionPanel, Detail, List, showHUD, showToast, Toast } from "@raycast/api"
import { useState } from "react"
import { runPowerShellScript, usePromise } from "@raycast/utils"
import { safeSearchRegex } from "./helper/searchRegex"
import { getPackageList, PackageRegistryInfo } from "./helper/wsa"

export default function Command() {
	const [search, setSearch] = useState("")
	const [packages, setPackages] = useState<PackageRegistryInfo[]>([])

	usePromise(async () => {
		await showToast({ style: Toast.Style.Animated, title: "Loading..." })
		setPackages(await getPackageList())
		await showToast({ style: Toast.Style.Success, title: "Loaded" }).then(toast => {
			setTimeout(() => {
				toast.hide()
			}, 2500)
		})
	})

	const searchRegex = safeSearchRegex(search)

	return (
		<List
			navigationTitle="Windows Subsystem for Android"
			searchBarPlaceholder="Search Applications..."
			onSearchTextChange={setSearch}
		>
			{packages
				.filter(({ name }) => searchRegex.test(name))
				.map(({ author, icon, id, name }) => (
					<List.Item
						key={id}
						title={name}
						subtitle={id}
						accessories={[{ text: author }]}
						icon={icon}
						actions={
							<ActionPanel>
								<Action
									title="Launch"
									onAction={async () => {
										await runPowerShellScript("WsaClient.exe /launch wsa://" + id)
										await showHUD(`Lauching ${name}...`)
									}}
								/>
								<Action
									shortcut={{ modifiers: ["ctrl", "shift"], key: "a" }}
									title="App Settings"
									onAction={async () => {
										await runPowerShellScript("WsaClient.exe /modify " + id)
									}}
								/>
								<Action shortcut={{ modifiers: ["ctrl", "shift"], key: "d" }} title="Uninstall" />
							</ActionPanel>
						}
					/>
				))}
		</List>
	)
}

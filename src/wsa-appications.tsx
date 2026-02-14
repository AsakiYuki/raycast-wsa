import { Action, ActionPanel, List, showHUD, showToast, Toast } from "@raycast/api"
import { useState } from "react"
import { usePromise } from "@raycast/utils"
import { safeSearchRegex } from "./helper/searchRegex"
import { getPackageList, launchPackage, openPackageSettings, PackageRegistryInfo, uninstallPackage } from "./helper/wsa"
import { rmSync } from "fs"

export default function Command() {
	const [search, setSearch] = useState("")
	const [packages, setPackages] = useState<PackageRegistryInfo[]>([])

	usePromise(async () => {
		await showToast({ style: Toast.Style.Animated, title: "Loading..." })
		setPackages(await getPackageList())
		await showToast({ style: Toast.Style.Success, title: "Loaded" }).then(toast => {
			setTimeout(() => {
				toast.hide()
			}, 1000)
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
				.map(({ author, icon, id, name, canUninstall, shortcut }) => (
					<List.Item
						key={id}
						title={name}
						subtitle={id}
						accessories={[{ text: author }]}
						icon={{
							source: `data:image/png;base64,${icon}`,
							fallback: "extension-icon.png",
						}}
						actions={
							<ActionPanel>
								<Action
									title="Launch"
									onAction={async () => {
										await launchPackage(id)
										await showHUD(`Lauching ${name}...`)
									}}
								/>
								<Action
									shortcut={{ modifiers: ["ctrl", "shift"], key: "a" }}
									title="App Settings"
									onAction={async () => {
										await openPackageSettings(id)
										await showHUD(`Opening ${name} Settings...`)
									}}
								/>
								{canUninstall ? (
									<Action
										shortcut={{ modifiers: ["ctrl", "shift"], key: "d" }}
										onAction={async () => {
											await showHUD(`Uninstalling ${name}...`)
											await uninstallPackage(id)
											if (shortcut) rmSync(shortcut)
											setPackages(await getPackageList())
											await showHUD(`Uninstalled ${name}`)
										}}
										title="Uninstall"
									/>
								) : null}
							</ActionPanel>
						}
					/>
				))}
		</List>
	)
}

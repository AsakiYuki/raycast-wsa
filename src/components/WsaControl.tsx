"use client"
import { runPowerShellScript, usePromise } from "@raycast/utils"

import { isRunning } from "../helper/wsa"
import { Action, ActionPanel, List, showHUD } from "@raycast/api"
import { Dispatch, SetStateAction, useState } from "react"

export function WsaPowerControl({
	onStateChange,
	search,
}: {
	onStateChange?: Dispatch<SetStateAction<boolean | null>>
	search: RegExp
}) {
	const [running, setRuning] = useState<boolean | null>(null)

	const check = async () => {
		const $ = await isRunning()
		if ($ === running) return
		setRuning($)
		onStateChange?.($)
	}

	setInterval(check, 1000)

	check()

	if (running === null) return null

	const start = async () => {
		try {
			await showHUD("Starting WSA...")
			await runPowerShellScript("WsaClient.exe")
			await showHUD("WSA has been started")
		} catch (error) {
			await showHUD("Failed to start WSA")
		}
	}

	const shutdown = async () => {
		try {
			await showHUD("Shutting down WSA...")
			await runPowerShellScript("WsaClient.exe /shutdown")
			await showHUD("WSA has been shutdown")
		} catch (error) {
			await showHUD("Failed to shutdown WSA")
		}
	}

	const title = running ? "Stop" : "Start"
	const icon = running ? "poweroff.ico" : "poweron.ico"
	const action = running ? shutdown : start

	return search.test(title) ? (
		<List.Item
			title={title}
			icon={icon}
			actions={
				<ActionPanel title="Windows Subsystem for Android">
					<Action title="Actions" onAction={action} />
				</ActionPanel>
			}
		/>
	) : null
}

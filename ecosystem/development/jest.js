import path from 'path'
import Process from '@mhy/process/dist'

import { moduleHome } from '../..'

const onlyChangedFlag = '--onlyChanged'
const watchFlag = '--watch'
const watchAllFlag = '--watchAll'
const getJestCLICmd = (flags = []) => [
	'node',
	require.resolve('jest-cli/bin/jest.js'),
	'--passWithNoTests',
	`--config=${path.resolve(moduleHome, 'jest/index.js')}`,
	...flags
]

const getJestServeCLICmd = (flags) => [
	'node',
	require.resolve('chokidar-cli/index.js'),
	`"src/**/*.js"`,
	'-c',
	`"${getJestCLICmd(flags).join(' ')}"`,
	'--initial',
	'--ignore',
	'"node_modules"'
]

class Jest extends Process {
	get commandToUse() {
		return process.MHY_ENV === 'ui'
			? getJestServeCLICmd
			: getJestCLICmd
	}

	constructor(defaultAction = 'start') {
		super()
		this.run(defaultAction)
	}

	onStart = ({name}, {flags = []}) => this.spawn(name, this.commandToUse(flags))

	onWatch = ({name}, {flags = []}) => this.spawn(name, this.commandToUse([...flags, watchFlag]))

	onWatchAll = ({name}, {flags = []}) => this.spawn(name, this.commandToUse([...flags, watchAllFlag]))

	onRunAll = async () => {
		await this.kill('start')
		this.run('start')
	}

	onOnlyChanged = async () => {
		await this.kill('start')
		this.run('start', { flags : [onlyChangedFlag] })
	}

	// Feature test only
	processLine(d) {
		if (d.startsWith('change:')) {
			this.emit('action', 'clear')
		}
		return d
			.replace('PASS', '{green-bg} PASS {/green-bg}')
			.replace('FAIL', '{red-bg} FAIL {/red-bg}')
	}

	actions = [
		{
			name: 'start',
			enabled: true,
			onRun: this.onStart
		},
		{
			name: 'changed',
			label: 'Only Changed',
			shortcut: 'c',
			enabled: true,
			onRun: this.onOnlyChanged
		},
		{
			name: 'all',
			label: 'Run All',
			shortcut: 'a',
			enabled: true,
			onRun: this.onRunAll
		},
		{
			name: 'watch',
			enabled: true,
			onRun: this.onWatch
		},
		{
			name: 'watch-all',
			enabled: true,
			onRun: this.onWatchAll
		}
	]
}

module.exports.default = () => Jest


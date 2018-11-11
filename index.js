import fg from 'fast-glob'
import fs from 'fs'
import path from 'path'

process.env.NODE_ENV = process.env.NODE_ENV || 'development'

/**
 * Environment and configuration.
 * The `mhyJSONConfiguration`
*/
const environment = module.exports.environment = process.env.NODE_ENV
const packageJSONFile = path.resolve(process.cwd(), 'package.json')
const mhyJSONConfiguration = fs.existsSync(packageJSONFile)
	? JSON.parse(fs.readFileSync(packageJSONFile, 'utf8')).mhy || {}
	: {}
export const moduleHome = path.resolve(__dirname)
const indexTemplatePath = 'src/index.html'
const indexTemplatePathProject = path.resolve(process.cwd(), indexTemplatePath)
let indexTemplatePathMhy = path.resolve(moduleHome, '../../../../', indexTemplatePath)
export const indexTemplate = fs.existsSync(indexTemplatePathProject)
	? indexTemplatePathProject
	: indexTemplatePathMhy

export const load = (module, defaults = {}) => {
	applyEntries(module, 'root', defaults)
	applyEntries(module, environment, defaults)
	applyJSON(module, 'root', defaults)
	applyJSON(module, environment, defaults)
	return defaults
}

const applyEntries = (module, env, o) => {
	const entries = fg.sync([path.resolve(__dirname, module, env, '**/*')], { ignore: ['index.js'] })
	for (const entry of entries) {
		const segments = entry.replace(new RegExp(`.*/config/.*${module}/${env}/`), '').split('/')
		let tmp = o
		segments.forEach((v, k) => {
			if (Array.isArray(tmp)) {}
			else if (k < segments.length - 1) {
				tmp[v] = tmp[v] || {}

				if (Array.isArray(tmp[v])) {
					tmp[v] = tmp = require(entry).default(tmp[v])
				}
				else {
					tmp = tmp[v]
				}
			}
			else {
				v = v.replace('.js', '')
				tmp[v] = require(entry).default(tmp[v])
			}
		})
	}
}

const applyJSON = (module, env, o, j) => {
	try {
		j = j || mhyJSONConfiguration[module][env] || {}
	} catch (e) { return }

	for (const [k, v] of Object.entries(j)) {
		if (v instanceof Object) {
            o[k] = o[k] || v || {}
			applyJSON(module, env, o[k] || {}, v)
		}
		else {
			o[k] = v
		}
	}
}
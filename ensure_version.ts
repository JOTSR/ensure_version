import { releases, semver } from './deps.ts'

export type Version = typeof Deno.version

type ImportMeta = {
    url: string,
    main: boolean,
    resolve: (path: string) => string
}

type AtLeastOne<T, U = {[K in keyof T]: Pick<T, K>}> = Partial<T> & U[keyof U]

const denoVersions = [...releases.text.matchAll(/### (\d+)\.(\d+)\.(\d+)/g) as string[][]].map(line => {
    const [ major, minor, patch ] = line.slice(1).map(number => parseInt(number))
    return { major, minor, patch } as const
})

/**
 * Throw if required version of Deno is not validate
 * Log warn(minor)/info(patch) if version is version is valid but can be updated
 * 
 * @param {string} version Required version (semver syntax) of Deno
 * @param {boolean=} logs Enable log if update minor and patch is possible (default: true)
 * @param {ImportMeta} importer Accept ```import.meta```, if defined write the importer script url in log and error message
 * @throws {TypeError} Semver parse error
 * @throws {RangeError} Version mismatch
 * 
 * @exemple
 * Warning
 * ```ts
 * // Deno.version.deno = '1.9.4'
 * ensureVersion('>=1.8.0')
 * //warn minor updated
 * ```
 * Throw
 * ```ts
 * // Deno.version.deno = '1.9.4'
 * ensureVersion('1.9.3')
 * //throw version error
 * ```
 * Pass
 * ```ts
 * // Deno.version.deno = '1.9.4'
 * ensureVersion('1.5.2 || 1.8.0 - 2.0.0')
 * //pass
 * ```
 * Log importer url in log and messages error
 * ```ts
 * ensureVersion('1.26', true, import.meta)
 * ```
 */
export function ensureVersion(version: string, logs?: boolean, importer?: ImportMeta): void

/**
 * Throw if required version of Deno is not validate
 * Log warn(minor)/info(patch) if version is version is valid but can be updated
 * 
 * @param {Deno.version} version  Required version (semver syntax) of at least ones of Deno, Typescript, V8
 * @param {boolean=} logs Enable log if update minor and patch is possible (default: true)
 * @param {ImportMeta} importer Accept ```import.meta```, if defined write the importer script url in log and error message
 * @throws {TypeError} Semver parse error
 * @throws {RangeError} Version mismatch
 * 
 * @exemple
 * Warning
 * ```ts
 * // Deno.version = {deno: '1.9.4', typescript: '4.5.2', v8: '9.9.115.7'}
 * const required = {deno: '>=1.8.0'}
 * ensureVersion(required)
 * //warn minor updated
 * ```
 * Throw
 * ```ts
 * // Deno.version = {deno: '1.9.4', typescript: '4.5.2', v8: '9.9.115.7'}
 * const required = {deno: '>=1.8.0', typescript: '3.2.1'}
 * ensureVersion(required)
 * //throw version error
 * ```
 * Throw
 * ```ts
 * // Deno.version = {deno: '1.9.4', typescript: '4.5.2', v8: '9.9.115.7'}
 * const required = {}
 * ensureVersion(required)
 * //warn empty argument
 * ```
 * Pass
 * ```ts
 * // Deno.version = {deno: '1.9.4', typescript: '4.5.2', v8: '9.9.115.7'}
 * const required = {deno: '<1.9.5', typescript: '4.0.0 - 4.5.2', v8: '8.3.102 || 9.9.155'}
 * ensureVersion(required)
 * //pass
 * ```
 * Log importer url in log and messages error
 * ```ts
 * ensureVersion('1.26', true, import.meta)
 * ```
 */
export function ensureVersion(version: AtLeastOne<Version>, logs?: boolean, importer?: ImportMeta): void

export function ensureVersion(version: AtLeastOne<Version> | string, logs = true, importer?: ImportMeta): void {
    
    if (version === undefined) {
        throw new TypeError(`"version" : [${version}] is not a valid semver`)
    }

    if (typeof version === 'string') {
        version = {deno: version}
    }

    if (!Object.keys(version).length) {
        throw new TypeError(`version "${JSON.stringify(version)}" should have at least one of these keys [${Object.keys(Deno.version).join(', ')}]`)
    }

    const importerName = importer ? ` by ${importer.url}` : ''

    for (const _key in Deno.version) {
        const key  = _key as keyof Version
        const origin = Deno.version[key].split('.').slice(0, 3).join('.')
        const required = version[key]?.split('.').slice(0, 3).join('.')
        
        if(required === undefined) continue
        //TODO Get typescript and v8 last versions depending of deno version
        if (key === 'typescript' || key === 'v8') continue

        if(!semver.satisfies(origin, required)) {
            throw new RangeError(`${key}@${origin} not match version ${version[key]} required${importerName}`)
        }
        
        const maxOrigin = maxOriginVersion(required)
        if(semver.minor(maxOrigin) !== semver.minor(origin) && logs) {
            console.warn(`%c${key}@${origin} not match maximum minor ${required} required${importerName}, ${key} minor can be upgraded to ${maxOrigin}`, 'color: yellow')
            continue
        }

        if(semver.patch(maxOrigin) !== semver.patch(origin) && logs) {
            console.info(`%c${key}@${origin} not match maximum patch ${required} required${importerName}, ${key} patch can be upgraded to ${maxOrigin}`, 'color: grey')
        }
    }
}

function maxOriginVersion(requiredVersion: string): string {
    const originVersions = denoVersions
        .map(version => `${version.major}.${version.minor}.${version.patch}`)

    return semver.maxSatisfying(originVersions, requiredVersion) ?? requiredVersion
}
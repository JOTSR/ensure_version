import { semver } from './deps.ts'

export type Version = typeof Deno.version

type AtLeastOne<T, U = {[K in keyof T]: Pick<T, K>}> = Partial<T> & U[keyof U]

/**
 * Throw if required version of Deno is not validate
 * Log warn(minor)/info(patch) if version is version is valid but can be updated
 * 
 * @param {string} version Required version (semver syntax) of Deno
 * @param {boolean=} logs Enable log if update minor and patch is possible (default: true)
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
 */
export function ensureVersion(version: string, logs?: boolean): void

/**
 * Throw if required version of Deno is not validate
 * Log warn(minor)/info(patch) if version is version is valid but can be updated
 * 
 * @param {Deno.version} version  Required version (semver syntax) of at least ones of Deno, Typescript, V8
 * @param {boolean=} logs Enable log if update minor and patch is possible (default: true)
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
 */
export function ensureVersion(version: AtLeastOne<Version>, logs?: boolean): void

export function ensureVersion(version: AtLeastOne<Version> | string, logs = true): void {
    
    if (version === undefined) {
        throw new TypeError(`"version" : [${version}] is not a valid semver`)
    }

    if (typeof version === 'string') {
        version = {deno: version}
    }

    if (!Object.keys(version).length) {
        throw new TypeError(`version "${JSON.stringify(version)}" should have at least one of these keys [${Object.keys(Deno.version).join(', ')}]`)
    }

    for (const _key in Deno.version) {
        const key  = _key as keyof Version
        const origin = Deno.version[key].split('.').slice(0, 3).join('.')
        const required = version[key]
        
        if(required === undefined) continue

        if(!semver.satisfies(origin, required)) {
            throw new RangeError(`${key}@${origin} not match version ${version[key]} required by ${import.meta.url}`)
        }

        if(maxMinor(origin, required) && logs) {
            console.warn(`%c${key}@${origin} not match maximum minor ${version[key]} required by ${import.meta.url}, ${key} minor can be upgraded`, 'color: yellow')
            continue
        }

        if(maxPatch(origin, required) && logs) {
            console.info(`%c${key}@${origin} not match maximum patch ${version[key]} required by ${import.meta.url}, ${key} patch can be upgraded`, 'color: grey')
        }
    }
}

function maxMinor(originVersion: string, requiredVersion: string): boolean {
    const originMajor = semver.major(originVersion)

    const originMinors = range(semver.minor(originVersion), 100)
    const originVersions = originMinors.map(originMinor => `${originMajor}.${originMinor}.0`)

    return Boolean(semver.maxSatisfying(originVersions, requiredVersion))
}

function maxPatch(originVersion: string, requiredVersion: string): boolean {
    const originMajor = semver.major(originVersion)
    const originMinor = semver.minor(originVersion)

    const originPatchs = range(semver.patch(originVersion), 500)
    const originVersions = originPatchs.map(originPatch => `${originMajor}.${originMinor}.${originPatch}`)

    return Boolean(semver.maxSatisfying(originVersions, requiredVersion))
}

function range(min: number, max: number): number[] {
    return new Array(max - min).fill(1).map((_, i) => i + min + 1)
}
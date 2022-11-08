/**
 * Simple version ensurer for [Deno](https://deno.land) that check {deno, typescript, v8} version for users of your module and prevent them from incompatibylities error.
 *
 * Use [semver](https://deno.land/std/semver) to check versions
 *  
 * [![Tags](https://img.shields.io/github/v/release/JOTSR/ensure_version)](https://github.com/JOTSR/ensure_version/releases)
 * [![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/raw.githubusercontent.com/JOTSR/ensure_version/main/mod.ts)
 * 
 * ## Usage
 * 
 * Import
 * ```ts
 * import ensureVersion from "https://deno.land/x/ensure_version/mod.ts";
 * ```
 * 
 * Simply add it in your mod.ts
 * ```ts
 * //some semver version constraint
 * ensureVersion(">1.18.0")
 * //or full Deno.version
 * ensureVersion({ deno: "1.19.2", v8: "9.9.115.7", typescript: "4.5.2" })
 * ```
 * 
 * ## Examples
 * 
 * ```ts
 *  // Deno.version.deno = "1.9.4"
 *  ensureVersion(">=1.8.0")
 *  //warn minor updated
 * 
 *  // Deno.version.deno = "1.9.4"
 *  ensureVersion("1.9.3")
 *  //throw version error
 *  
 *  // Deno.version.deno = "1.9.4"
 *  ensureVersion("1.5.2 || 1.8.0 - 2.0.0")
 *  //pass
 * 
 *  // Deno.version = {deno: "1.9.4", typescript: "4.5.2", v8: "9.9.115.7"}
 *  const required = {deno: ">=1.8.0"}
 *  ensureVersion(required, false)
 *  //no logs
 * 
 *  // Deno.version = {deno: "1.9.4", typescript: "4.5.2", v8: "9.9.115.7"}
 *  const required = {deno: ">=1.8.0", typescript: "3.2.1"}
 *  ensureVersion(required)
 *  //throw version error
 * 
 *  // Deno.version = {deno: "1.9.4", typescript: "4.5.2", v8: "9.9.115.7"}
 *  const required = {}
 *  ensureVersion(required)
 *  //warn empty argument
 * 
 *  // Deno.version = {deno: "1.9.4", typescript: "4.5.2", v8: "9.9.115.7"}
 *  const required = {deno: "<1.9.5", typescript: "4.0.0 - 4.5.2", v8: "8.3.102 || 9.9.155"}
 *  ensureVersion(required)
 *  //pass
 *  ```
 * 
 * @module
 */

import { ensureVersion } from './ensure_version.ts'
export { ensureVersion }
export type { Version } from './ensure_version.ts'

export default ensureVersion
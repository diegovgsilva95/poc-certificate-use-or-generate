import {readFile} from "fs/promises"
import { join } from "path"

let rootdir = join(new URL(import.meta.url).pathname, "../../")
export const CA_KEY = await readFile(join(rootdir, "./CA.key"), "utf-8")
export const CA_CRT = await readFile(join(rootdir, "./CA.crt"), "utf-8")
import { promises as fs } from "fs";
import { JS_JSON_TRANSFORMER_BIGINT, JS_LOG_ALLOWED } from "./js";
const BASE_DIR = "./data/";

export enum EFiles {
  SAMPLE = "sample/sample2.json",
  CONTRACTS = "bv-car/contracts-deployed.json",
  OUTPUT = "output.json",
}

export async function storageGet<T=any>(file: string|EFiles, defaultValue?:any) {
  try{
    JS_LOG_ALLOWED() && console.log(`[storage] reading file ${BASE_DIR+file}`)
    return JSON.parse(await fs.readFile(BASE_DIR+file, "utf8")) as T
  }catch(e:any) {
      return defaultValue as T;
  }
}

export async function storagePut(file: string|EFiles, data: any) {
  JS_LOG_ALLOWED() && console.log(`[storage] writing file ${BASE_DIR+file}`)
  return await fs.writeFile(BASE_DIR+file, JSON.stringify(data, JS_JSON_TRANSFORMER_BIGINT, 2), "utf8")
}


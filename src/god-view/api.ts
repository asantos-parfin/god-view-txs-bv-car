import axios from 'axios';
import { storageGet, EFiles } from '../globals/storage';
import { JS_LOG_ALLOWED } from '../globals/js';
import dotenv from 'dotenv';
dotenv.config();

//#region [Axios]
const API = process.env.GOD_VIEW_API || "http://rayls-api-v2-4.api.blockchain-sandbox.parfin.aws";
console.log("[env] GOD_VIEW_API =", API)

const http = axios.create()

http.interceptors.request.use((config) => {
    config.headers['request-startTime'] = process.hrtime()
    return config
})

http.interceptors.response.use((response) => {
    const start = response.config.headers['request-startTime']
    const end = process.hrtime(start)
    const milliseconds = Math.round((end[0] * 1000) + (end[1] / 1000000))
    response.headers['request-duration'] = milliseconds
    return response
})
//#endregion


/**
 * Get transactions from god-view (governance-api).
 * 
 * @param args 
 *  'proxyQueryString' => Send http query-string to god-view.
 *  'local' => if true the txs will be load from local json file data/bvtest-sample/sample.json.
 * @returns 
 */
export async function godViewGet(args: {
  proxyQueryString?: any,
  local?:boolean
}){
  JS_LOG_ALLOWED() && console.log(`[god-view] getting last txs...`)

  // load cached json response
  if(args.local){
    JS_LOG_ALLOWED() && console.log(`[god-view] from local sample file... `)
    return (await storageGet(EFiles.SAMPLE));
  }

  // fetch from god-view api
  const apiTxs = `${API}/audit/transactions`;
  JS_LOG_ALLOWED() && console.log(`[god-view] from API ${apiTxs}... `)

  const response = await http.get(apiTxs, {params: args.proxyQueryString});
  console.log("[god-view/api] response time ms", response.headers['request-duration'], response.config.url, response.config.params)
  return response.data;
}
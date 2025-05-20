import axios from 'axios';
import { storageGet, EFiles } from '../storage';
import { IContract } from '../types';

const API = "http://rayls-api-v2-4.api.blockchain-sandbox.parfin.aws";

export async function godTxsFetcher(args: {local:boolean} = {local:false}){
  console.log(`[god-view] getting last txs...`)
  if(args.local){
    console.log(`[god-view] from local sample file... `)
    return (await storageGet(EFiles.SAMPLE)).data;
  }

  const apiTxs = `${API}/audit/transactions?limit=100`;
  console.log(`[god-view] from API ${apiTxs}... `)

  const result = await axios.get(apiTxs);
  const txs = result.data.data;

  return txs
}
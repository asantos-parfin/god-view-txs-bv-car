import { inspect } from "util";
import { promises as fs } from "fs";
import _ from "lodash";
import axios from 'axios';
import { Block, Interface, isHexString, TransactionDescription, TransactionReceipt, TransactionResponse, } from "ethers";
import { IContract, IGodTx, IGodTxAndContract } from "./globals/types";
import { JS_JSON_TRANSFORMER_BIGINT } from "./globals/js";
import { bvContracts } from "./globals/contracts";
import { godTxsFetcher } from "./globals/god-view/api";
import { godTxsFilterKnownContracts } from "./globals/god-view/parser";
import { storagePut, EFiles } from "./globals/storage";

//#region [Types]


//#endregion

//#region [Storage]

//#endregion

//#region [Services]

//#endregion

//#region [God parser]

//#endregion

//#region [Payload Decode]
type TDecodedInputHandled = {
  argsRaw: string, argsTxt: string, argsObj: any, methodSignature: string
}

export const decodeInput = (input: string, abi: string) => {
  const iface = new Interface(abi);
  return iface.parseTransaction({
    data: input,
  });
};

export const decodeInputHandler = (decodedData: TransactionDescription) => {
  let methodSignature = "";
  let argsRaw = JSON.stringify(decodedData.args, JS_JSON_TRANSFORMER_BIGINT);
  let argsTxt = argsRaw;
  const argsObj: any = {};

  try {
    if (decodedData.args.length) {
      // args obj
      decodedData.args.forEach((arg, idx) => {
        let paramName = decodedData.fragment.inputs[idx].name; // decodedData.functionFragment.inputs[idx].name
        argsObj[paramName] = decode_ArgsFormatter(arg);
      });

      // args txt
      argsTxt = decodedData.args.reduce((p, arg) => p + "," + decode_ArgsFormatter(arg), "").slice(1);

      methodSignature = `${decodedData.name}(${argsTxt
        .split(",")
        .reduce((p, c) => p + c + ", ", "")
        .slice(0, -2)})`;
    }
  } catch (e) {
    console.error("service/contract.ts->handleTxInputDecoded() decode data error!");
    console.error(e);
  }

  return { argsRaw, argsTxt, argsObj, methodSignature } as TDecodedInputHandled;
};

const decode_ArgsFormatter = (arg: any): string => {
  if (isHexString(arg) || typeof arg === "number" || typeof arg === "string") {
    return arg as string;
    //.replace(/\u0000/g, "")
  } else if (typeof arg === "object" && arg !== null) {
    // console.log("typeof", String(typeof arg))
    return JSON.stringify(arg, JS_JSON_TRANSFORMER_BIGINT);
  }

  return String(arg);
};
//#endregion

//#region [Main]

(async () => {
  console.info(`[INFO] STARTING....`)

  //#region [god-view fetch/parser]
  // contracts
  console.info(`\n[INFO] READING KNOWN CONTRACTS LIST...`)
  const cs = await bvContracts();
  console.info(`> CONTRACTS LIST LENGTH =`, cs.length)

  // god txs
  console.info(`\n[INFO] FETCING GOD-VIEW TXS...`)
  const txsGod = await godTxsFetcher({local:true})
  console.info(`> TXS GOD LIST LENGTH =`, txsGod.length)

  // filter god txs msgs from known contracts
  console.info(`\n[INFO] STARTING PARSE GOD-VIEW TXS....`)
  const dictTxsByMsgId = godTxsFilterKnownContracts({
    contracts: cs, 
    txs: txsGod
  });
  console.info(`\n> TXS CONTRACTS KNOWN FOUNDED =`, dictTxsByMsgId.size);
  
  // output
  console.info(`\n[INFO] PARSER FINISHED! WRITING OUTPUT...`)
  const txsParsed = Array.from(dictTxsByMsgId.values());
  await storagePut(EFiles.OUTPUT, txsParsed);
  //#endregion

  //#region [output analysis]
  // sort desc
  txsParsed.sort((a, b) => 
    (new Date(b.tx.createdAt)).getTime() - (new Date(a.tx.createdAt)).getTime()
  );

  // output
  console.info(`\n[INFO] OUTPUT`)
  console.log("> TXS LENGTH", txsParsed.length);
  console.table(txsParsed.map(tx => 
    ({
      craeted: tx.tx.createdAt,
      txMessageId: tx.tx.messageId,

      // resourceId contracts
      chainId: _.truncate(tx.contract.resourceIds?.map(c => c?.chainId).join(","), {length: 25, omission: "..."}), 
      contract: _.truncate(tx.contract.resourceIds?.map(c => c?.name).join(","), {length: 25, omission: "..."}),
      addr: _.truncate(tx.contract.resourceIds?.map(c => c?.addr).join(","), {length: 25, omission: "..."}),

      // source/dest contracts
      sourceAddresses: tx.contract.destinationAddresses.length ? _.truncate(tx.contract.destinationAddresses?.map(c => "["+c?.chainId+"]" + c?.name).join(","), {length: 25, omission: "..."}) : undefined,
      destionationAddress: tx.contract.sourceAddress ? `${tx.contract.sourceAddress?.chainId} ${tx.contract.sourceAddress?.name}` : undefined,

      // msg payload
      payload: tx.tx.payloads?.length,
      payloadDecoded: tx.payload?.args,
      payloadSignature: tx.payload?.signature,
    })
  ))

  //#endregion

})()

//#endregion


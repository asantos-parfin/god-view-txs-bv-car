import { Block, Interface, isHexString, TransactionDescription, } from "ethers";
import { JS_JSON_TRANSFORMER_BIGINT } from "./js";
import { storageGet, EFiles } from "./storage";
import { IContract } from "./types";

//#region [App Contracts]
export async function bvContracts() {
  return await storageGet<IContract[]>(EFiles.CONTRACTS);
}
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
import _ from "lodash";
import { decodeInput, decodeInputHandler } from "../globals/contracts";
import { JS_LOG_ALLOWED, JS_LOG_SAMELINE } from "../globals/js";
import { IGodTx, IContract, IGodTxWrapped } from "../globals/types";

/**
 * Read the god-view (governance-api) response,
 * search by known contracts through source, destination and resourceId fields,
 * decode the payloads (if exists and contract is founded)
 * wrap the tx god-view object into a wrapped IGodTxWrapped object.
 *
 * @returns An object with a 'dict : Map<msgId, IGodTxWrapped>' and 'lst : IGodTxWrapped[]'.
 */
export function godViewParserTxs(args: { txs: IGodTx[]; contracts: IContract[] }) {
  const startTime = process.hrtime();
  const { txs, contracts } = args;
  const dict: Map<string, IGodTxWrapped> = new Map();

  JS_LOG_ALLOWED() && console.log(`[god-view-parser] reading god-view txs ${txs.length}... `);
  for (let i = 0; i < txs.length; i++) {
    const tx = txs[i];
    // process.stdout.write(`\r[god-view-parser] parsing tx ${i+1} > ${tx.messageId}...`)
    JS_LOG_ALLOWED() && JS_LOG_SAMELINE(`[god-view-parser] parsing tx ${i + 1} > ${tx.messageId}...`);

    // get the address related with god tx...
    const tSourceAddr = tx.sourceAddress?.toLowerCase().trim();
    const tDestinationAddr = tx.destinationAddresses?.map((addr) => addr.toLowerCase().trim());
    const tResourceId = tx.resourceIds?.map((addr) => addr.toLowerCase().trim());

    const tSourceChainId = tx.sourceChainId.toString();
    const tDestinationChainIds = tx.destinationChainIds?.map((s) => s.toLowerCase().trim());
    const tPayloadsLength = tx.payloads?.length || undefined;

    // wrapped god tx identify if the contract is into god view tx....
    const wrappedTx = {
      tx: tx,
      contracts: {
        sourceAddress: null,
        destinationAddresses: [],
        resourceIds: [],
      },
      payloads: tPayloadsLength ? [] : undefined,
    } as IGodTxWrapped;

    // search for known contract that matchs with tx addresses related...
    contracts.forEach((contract) =>
      (async () => {
        const cChainId = contract.chainId.toString();
        const cAddr = contract.addr?.toLowerCase().trim();
        const cResId = contract.resourceId?.toLowerCase().trim().substring(2);
        const handledContract = _.clone(_.omit(contract, "abi"));

        // check source addr
        if (tSourceAddr == cAddr && tSourceChainId == cChainId) wrappedTx.contracts.sourceAddress = handledContract;

        // check dest addr
        tDestinationAddr?.forEach((tDestAddr) => {
          if (tDestAddr == cAddr && tDestinationChainIds.includes(cChainId))
            wrappedTx.contracts.destinationAddresses.push(handledContract);
        });

        // check resId
        tResourceId?.forEach((tResId) => {
          if (tResId == cResId && (tDestinationChainIds.includes(cChainId) || tSourceChainId.includes(cChainId)))
            wrappedTx.contracts.resourceIds.push(handledContract);
        });

        // payload
        if (
          tPayloadsLength && // IF payload exists...
          // IF theres any contract related..
          (wrappedTx.contracts.sourceAddress ||
            wrappedTx.contracts.destinationAddresses.length ||
            wrappedTx.contracts.resourceIds.length)
        ) {
          const abi = contract.abi;

          wrappedTx.tx.payloads.forEach((payload, idx) => {
            try {
              payload = "0x" + payload;
              // try decode payload with current contract
              if (!abi)
                throw Error(
                  `[ERROR] CONTRACT WITHOUT ABI!!! [${contract.chainId}] ${contract.name} (${contract.addr})`
                );
              const inputDecoded = decodeInput(payload, abi);
              if (inputDecoded) {
                const inputDecodedHandled = decodeInputHandler(inputDecoded);
                if (inputDecoded) {
                  // check if payload was not already decoded
                  if(idx+1 > (wrappedTx.payloads ? wrappedTx.payloads?.length : 0)) {
                    wrappedTx.payloads?.push({
                      selector: inputDecoded.selector,
                      signature: inputDecoded.signature,
                      args: inputDecodedHandled.methodSignature,
                      contract: contract.name,
                    });
                  }

                }
              }
            } catch (e) {
              console.error(`[ERROR] PAYLOAD DECODE TX messageId =`, tx.messageId);
              console.log(_.omit(contract, "abi"));
              console.debug(payload);
              console.log(e);
            }
          });
        }

        dict.set(tx.messageId, wrappedTx);
      })()
    );
  }
  const lst = Array.from(dict.values());

  const end = process.hrtime(startTime);
  const milliseconds = Math.round(end[0] * 1000 + end[1] / 1000000);
  console.log(`[god-view/parser] parsed/wrapped ${lst.length} txs in ${milliseconds} ms`);

  return { dict, lst };
}

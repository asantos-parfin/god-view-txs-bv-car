import { decodeInput, decodeInputHandler } from "../contracts";
import { JS_LOG_SAMELINE } from "../js";
import { IGodTx, IContract, IGodTxAndContract } from "../types";

export function godTxsFilterKnownContracts(args: {
  txs: IGodTx[], 
  contracts: IContract[]
}){
  const { txs, contracts } = args;
  const dict : Map<string, IGodTxAndContract> = new Map();
  
  console.log(`[god-view-parser] reading god-view txs ${txs.length}... `)
  for(let i=0; i<txs.length; i++){
    const tx = txs[i];
    // process.stdout.write(`\r[god-view-parser] parsing tx ${i+1} > ${tx.messageId}...`)
    JS_LOG_SAMELINE(`[god-view-parser] parsing tx ${i+1} > ${tx.messageId}...`)

    // get the address related with god tx...
    const tSourceAddr = tx.sourceAddress?.toLowerCase().trim();
    const tDestinationAddr = tx.destinationAddresses?.map(addr => addr.toLowerCase().trim());
    const tResourceId = tx.resourceIds?.map(addr => addr.toLowerCase().trim());

    const tSourceChainId = tx.sourceChainId.toString();
    const tDestinationChainIds = tx.destinationChainIds.map(s => s.toLowerCase().trim())

    // wrapped god tx identify if the contract is into god view tx....
    const wrappedTx = {
      tx: tx,
      contract: {
        sourceAddress: null,
        destinationAddresses: [],
        resourceIds: [],
      }
    } as IGodTxAndContract;
    
    // search for known contract that matchs with tx addresses related...
    contracts.forEach(contract => (async () => {
      const cChainId = contract.chainId.toString();
      const cAddr = contract.addr?.toLowerCase().trim();
      const cResId = contract.resourceId?.toLowerCase().trim().substring(2)
      const handledContract = contract // _.clone(_.omit(contract, "abi"))

      // check source addr
      if(tSourceAddr == cAddr
        && tSourceChainId == cChainId
      ) wrappedTx.contract.sourceAddress = handledContract;

      // check dest addr
      tDestinationAddr.forEach(tDestAddr => {
        if(
          tDestAddr == cAddr
          && tDestinationChainIds.includes(cChainId)
        )
          wrappedTx.contract.destinationAddresses.push(handledContract);
      });

      // check resId
      tResourceId.forEach(tResId => {
        if(
          tResId == cResId
          && (
            tDestinationChainIds.includes(cChainId)
            || tSourceChainId.includes(cChainId)
          )
        )
          wrappedTx.contract.resourceIds.push(handledContract);
      })

      // payload
      if(wrappedTx.tx.payloads?.length){
        try {
          const abi = contract.abi;
          const payload = "0x"+wrappedTx.tx.payloads[0];

          // console.log(` [${contract.chainId}] ${contract.name} (${contract.addr}) `)
          if(!abi) throw Error(`[ERROR] CONTRACT WITHOUT ABI!!! [${contract.chainId}] ${contract.name} (${contract.addr})`)
          const inputDecoded = decodeInput(payload, abi)
          if(inputDecoded){
            const inputDecodedHandled = decodeInputHandler(inputDecoded)
            if(inputDecoded)wrappedTx.payload = { 
              signature: inputDecoded.signature,
              args: inputDecodedHandled.methodSignature
            } 
          }
        }
        catch(e){
          console.error(`[ERROR] PAYLOAD DECODE TX messageId =`, tx.messageId)
          console.debug(wrappedTx.tx.payloads[0])
          console.log(e);
        }
      }

      dict.set(tx.messageId, wrappedTx);
    })())
  }

  return dict;
}
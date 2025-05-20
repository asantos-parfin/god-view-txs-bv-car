import _ from "lodash";
import { bvContracts } from "./globals/contracts";
import { godTxsFetcher } from "./globals/god-view/api";
import { godTxsFilterKnownContracts } from "./globals/god-view/parser";
import { storagePut, EFiles } from "./globals/storage";

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
  const txsGod = await godTxsFetcher({proxyQueryString: undefined, local:true})
  console.info(`> TXS GOD LIST LENGTH =`, txsGod.data.length)

  // filter god txs msgs from known contracts
  console.info(`\n[INFO] STARTING PARSE GOD-VIEW TXS....`)
  const {dict, lst} = godTxsFilterKnownContracts({
    contracts: cs, 
    txs: txsGod.data
  });
  console.info(`\n> TXS CONTRACTS KNOWN FOUNDED =`, dict.size);
  
  // output
  console.info(`\n[INFO] PARSER FINISHED! WRITING OUTPUT...`)
  await storagePut(EFiles.OUTPUT, lst);
  //#endregion

  //#region [output analysis]
  // sort desc
  lst.sort((a, b) => 
    (new Date(b.tx.createdAt)).getTime() - (new Date(a.tx.createdAt)).getTime()
  );

  // output
  console.info(`\n[INFO] OUTPUT`)
  console.log("> TXS LENGTH", lst.length);
  console.table(lst.map(tx => 
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


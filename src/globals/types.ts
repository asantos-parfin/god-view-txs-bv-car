import { TransactionDescription } from "ethers";


export interface IContract {
  name: string;
  chainId: bigint;
  addr?: string;
  resourceId?: string;
  abi?: string;
  txDeploy?: string;
  walletDeploy?: string;
}

export interface IGodTx {
    messageId: string;
    sourceTransactionHash: string;
    destinationTransactionHashes: string[];
    statuses: string[];
    sourceChainId: string;
    destinationChainIds: string[];
    sourceTimestamp: string;
    sourceAddress: string;
    destinationAddresses: string[];
    amounts: string[];
    resourceIds: string[];
    messagesTypes: string[];
    transactionsTypes: string[];
    isFlagged: boolean;
    tokensNames: string[];
    tokensSymbols: string[];
    tokensBaseUrls: string[];
    isAtomic: boolean;
    destinationTimestamps: string[];
    sourceRevertTimestamp: string;
    table: string;
    payloads: string[];
    createdAt: string;
}

export type TDecodedInputHandled = {
  argsRaw: string, argsTxt: string, argsObj: any, methodSignature: string
}

export interface IGodTxWrapped {
  tx: IGodTx,
  contracts: {
    sourceAddress: IContract|null,
    destinationAddresses:(IContract|null)[],
    resourceIds: (IContract|null)[],
  },
  payloads?: {
    selector: string
    signature: string
    args: string
    contract: string
  }[],

}
import { Application, Request, Response } from "express";
import { JS_INSPECT, JS_JSON_TRANSFORMER_BIGINT } from "../globals/js";
import { godTxsFetcher } from "../globals/god-view/api";
import { bvContracts } from "../globals/contracts";
import { godTxsFilterKnownContracts } from "../globals/god-view/parser";

//#region [Routes]
export const routes = (app: Application) => {
  auditTransactions(app);
};
//#endregion

//#region [Controller]
function auditTransactions(app: Application) {
  app.get("/audit/transactions", async (req, res) => {
    res.setHeader("Content-Type", "application/json");

    // load app contracts
    const cs = await bvContracts();

    // god-view fetcher
    const godRes = await godTxsFetcher({ 
      proxyQueryString: req.query,
      // local: true
    });

    // parser contracts
    const {dict, lst} = godTxsFilterKnownContracts({
      contracts: cs,
      txs: godRes.data,
    });

    // replace the original txs with the wrappeds
    godRes.data = lst;

    // output
    res.send(JSON.stringify(godRes, JS_JSON_TRANSFORMER_BIGINT));
  });
}
//#endregion

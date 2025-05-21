# bv_dashboard_api

- **Proxy Governance-API Transactions**: `http://god-view-api/audit/transactions`
- Identify BV-CAR contracts using `data/bv-car/contracts-deployed.json` through Governance-API Transactions.
- Decode Governance-API Transaction `Payloads` using the ABI from the identified contracts.
- Return the same response from the Governance-API with each transaction item wrapped into an object, together with the identified contracts and decoded payloads.

# Setup
```shell
cp .env.example .env
```
* Check `GOD_VIEW_API`
* If not provided the `http://rayls-api-v2-4.api.blockchain-sandbox.parfin.aws` is default.

# Test
```shell
npm run test
```
* Local sample data at `./data/test-sample/sample.json`   
(from `http://GOD_VIEW_API/audit/transactions` response).

*  Check file `src/test.ts` function `godViewGet({local:true})`

# API
* http://localhost:8888

# DEV
```shell
npm run dev
```

# PROD
```shell
npm run start
```

# DOCKER
```shell
docker build -t god-view-txs-bv-car .
docker run --rm \ 
 -p 8888:8888 \
 --name god-view-txs-bv-car-container \
 god-view-txs-bv-car
```
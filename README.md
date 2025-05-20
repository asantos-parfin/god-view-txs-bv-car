# Setup Dotenv
```shell
cp .env.example .env
```

# Test CLI
```shell
npm run test
```

# Dev API
```shell
npm run dev
```

# Prod API
```shell
npm run start
```

# Docker API
```shell
docker build -t god-view-txs-bv-car .
docker run --rm -p 8888:8888 --name god-view-txs-bv-car-container god-view-txs-bv-car
```
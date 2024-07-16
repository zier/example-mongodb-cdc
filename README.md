# POC MongoDB CDC (Data Capture Change)

### Prerequisites

1. Install docker compose
2. Install node version 20.x
3. Install node package (npm i)

### Before start

please create database and collection and replace it in file index.js at line 8,9 for specific which database and collection we need to capture

```
// Database and Collection
const dbName = "hello";
const collectionName = "world";
```

### How to start

before start script please check resume_token.json field \_data is empty string

```
docker compose up
npm run start
```

### Mongo connection string

```
mongodb://localhost:27017/?directConnection=true
```

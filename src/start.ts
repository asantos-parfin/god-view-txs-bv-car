import express from "express";
import { routes } from "./server/routes";

//>npx nodemon --watch src --exec tsx src/start.ts
const app = express();
const PORT = process.env.port || 8888;

//APP
routes(app)

//START
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});



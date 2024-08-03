import express from "express";
import http from "http";
import { AddressInfo } from "net";

const app = express();
const server = http.createServer(app);

app.use(express.static("public"));

app.get("/warming", (req, res) => {
  res.send(`alive ${Date.now()}`);
});

const port = process.env.PORT || 8080;
server.listen(port, () => {
  const address = server.address() as AddressInfo;
  console.log(`Server listening on port ${address.port}`);
});

export default server;

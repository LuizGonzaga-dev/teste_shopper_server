import http from "http";
import app from "./app";

const runServer = (port: number, server: http.Server) => {
  server.listen(port, () => {
    console.log(`http://localhost:${port}`);
  });
};

const regularServer = http.createServer(app);
const serverPort: number = process.env.PORT ? parseInt(process.env.PORT) : 9000;
runServer(serverPort, regularServer);

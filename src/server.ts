import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import routes from './routes/routes';
import {requestIntercepter} from './utils/requestIntercepter';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all("*", requestIntercepter);
app.use("/", routes);

const runServer = (port: number, server: http.Server) => {
    server.listen(port, () => {
        console.log(`http://localhost:${port}`);
    })
};

const regularServer = http.createServer(app);
const serverPort: number = process.env.PORT ? parseInt(process.env.PORT) : 9000;
runServer(serverPort, regularServer);


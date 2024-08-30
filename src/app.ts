import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import routes from "./routes/routes";
import { requestIntercepter } from "./utils/requestIntercepter";
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json({ limit: "10mb" }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all("*", requestIntercepter);
app.use("/", routes);

export default app;

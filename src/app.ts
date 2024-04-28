import fs from "fs";
import path from "path";
import express, { Application, NextFunction, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import showdown from "showdown";

import morgan from "./middleware/morgan";

import assignId from "./middleware/assignId";
import healthRoute from "./routes/health";
import logger from "./utils/logger";

import { Request } from "./@types/Express";

const converter = new showdown.Converter();

const app: Application = express();
// disable `X-Powered-By` header that reveals information about the server
app.disable("x-powered-by");

// set security HTTP headers
app.use(helmet());

function handleJsonSyntaxError(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof SyntaxError && "body" in err && "status" in err && err.status === 400) {
    logger.error("Invalid JSON", { requestId: req.requestId });
    return res.status(400).json({ status: false, data: null, message: "Invalid JSON" });
  }
  next();
}

// parse json request body
app.use(express.json());
app.use(handleJsonSyntaxError);

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// enable cors
app.use(cors());
app.options("*", cors());

app.use(express.static("public"));

// log endpoints
app.use(assignId);
app.use(morgan);


app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "view"));
app.set("view engine", "pug");

const readmePath = path.join(__dirname, "../README.md");

const isFile = fs.existsSync(readmePath);
if (isFile) {
  app.get("/", (req, res) => {
    fs.readFile(readmePath, "utf8", (err, data) => {
      if (err) throw err;
      return res.render("index", { data: converter.makeHtml(data) });
    });
  });
}

app.use("/health", healthRoute);

export default app;

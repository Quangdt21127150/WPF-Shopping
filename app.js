require("dotenv").config();
const path = require("path");

const express = require("express");
const csrf = require("csurf");
const expressSession = require("express-session");
const https = require("https");
const cors = require("cors");
const fs = require("fs");

const opts = {
  requestCert: true,
  rejectUnauthorized: false,
  key: fs.readFileSync("./localhost.key", { encoding: "utf-8" }),
  cert: fs.readFileSync("./localhost.crt", { encoding: "utf-8" }),
};

const createSessionConfig = require("./config/session");
const db = require("./data/database");
const addCsrfTokenMiddleware = require("./middlewares/csrf-token");
const errorHandlerMiddleware = require("./middlewares/error-handler");
const checkAuthStatusMiddleware = require("./middlewares/check-auth");
const protectRoutesMiddleware = require("./middlewares/protect-routes");
const notFoundMiddleware = require("./middlewares/not-found");
const authRoutes = require("./routes/auth.routes");
const baseRoutes = require("./routes/base.routes");

const port = process.env.PORT | 3000;

const app = express();
const server = https.createServer(opts, app);

app.use(cors());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use("/assets", express.static("image-data"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const sessionConfig = createSessionConfig();

app.use(expressSession(sessionConfig));
app.use(csrf());

app.use(addCsrfTokenMiddleware);
app.use(checkAuthStatusMiddleware);

app.use(baseRoutes);
app.use(authRoutes);

app.use(notFoundMiddleware);

app.use(errorHandlerMiddleware);

db.connectToDatabase()
  .then(function () {
    server.listen(port, () =>
      console.log(`Example app listening on port ${port}!`)
    );
  })
  .catch(function (error) {
    console.log("Failed to connect to the database!");
    console.log(error);
  });

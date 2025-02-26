import "dotenv/config";
import express from "express";
import expressEjsLayouts from "express-ejs-layouts";
import methodOverride from "method-override";
import main from "./server/routes/main.js";
import admin from "./server/routes/admin.js";
import {dirname} from "path";
import {fileURLToPath} from "url";
import connectDB from "./server/config/database.js";
import cookieParser from "cookie-parser";
import MongoStore from "connect-mongo";
import session from "express-session";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port =  process.env.PORT || 3000 ;


connectDB();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride("_method"));

app.use(session({
    secret: "Keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    }),
    cookie: {
        maxAge: new Date(Date.now() + (3600000))
    }
}));

app.set('view engine', 'ejs');
app.set("layout", "layouts/main");

app.use(expressEjsLayouts);
app.use(express.static(__dirname + '/public'));
app.use(main);
app.use(admin);


app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
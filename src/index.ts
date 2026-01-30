import express, {Application, Request, Response} from "express";
import bodyParser from "body-parser";
import authRoute from "./routes/auth.routes";
import dotenv from "dotenv";
import { connectDatabase } from "./database/mongodb";
import { PORT } from "./config";
import morgan from "morgan";
import cors from "cors";
import path from "path";

dotenv.config();
console.log(process.env.PORT);
const app: Application = express();

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(bodyParser.json());

app.use("/api/auth", authRoute);


app.get("/", (req: Request, res: Response)=>{
    res.send("Hello World!");
});


async function startServer(){
    await connectDatabase();

    app.listen(
    PORT,
    ()=>{
        console.log(`Server: https://localhost:${PORT}`);
    }
)
}

startServer();
import express, {Application, Request, Response} from "express";
import bodyParser from "body-parser";
import authRoute from "./routes/auth.routes";
import dotenv from "dotenv";
import { connectDatabase } from "./database/mongodb";
import { PORT } from "./config";

dotenv.config();
//can use .env variable below this 
console.log(process.env.PORT);
const app: Application = express();
// const PORT: number = 3000;

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
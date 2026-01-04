import express, {Application, Request, Response} from "express";
import dotenv from "dotenv";
import { connectDatabase } from "./database/mongodb";
import { PORT } from "./config";

dotenv.config();
//can use .env variable below this 
console.log(process.env.PORT);
const app: Application = express();

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
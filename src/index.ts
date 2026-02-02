import express, {Application, Request, Response} from "express";
import bodyParser from "body-parser";
import authUserRoute from "./routes/admin/user.route";
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
let corsOptions = {
    origin: ["http://localhost:3000", "http://localhost:3005"],
    // which domain can access your backend server
    // add frontend domain in origin 
}
// origin: "*", // allow all domain to access your backend server
app.use(cors(corsOptions)); 

app.use(morgan("dev"));
app.use(bodyParser.json());

app.use("/api/auth", authRoute);
app.use('/api/admin/users', authUserRoute);

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
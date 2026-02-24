import express, {Application, Request, Response} from "express";
import bodyParser from "body-parser";
import authUserRoute from "./routes/admin/user.route";
import authRoute from "./routes/auth.routes";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import fs from "fs";
import restaurantRoute from "./routes/restaurant.routes";
import menuRoutes from "./routes/menu.routes";
import favouriteRoutes from "./routes/favourite.routes";
import reviewRoutes from './routes/review.routes';

dotenv.config();
console.log(process.env.PORT);
const app: Application = express();

const uploadsPath = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(uploadsPath, { recursive: true });

app.use("/uploads", express.static(uploadsPath));
// app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
let corsOptions = {
    origin: ["http://localhost:5050"],
    credentials: true,
    // which domain can access your backend server
    // add frontend domain in origin 
}
// origin: "*", // allow all domain to access your backend server
app.use(cors(corsOptions)); 

app.use(morgan("dev"));
app.use(bodyParser.json());

app.use("/api/auth", authRoute);
app.use('/api/admin/users', authUserRoute);
app.use("/api/restaurant", restaurantRoute);
app.use("/api/menu", menuRoutes);
app.use("/api/favourite", favouriteRoutes);
app.use("/api/review", reviewRoutes);

app.get("/", (req: Request, res: Response)=>{
    res.send("Hello World!");
});

export default app;

import { connectDatabase } from "./database/mongodb";
import { PORT } from "./config";
import app from "./app";
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
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path:"./"
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 7000,()=>{
        console.log(`server is running at PORT: ${process.env.PORT}`)
    });
})
.catch((err)=>{
    console.log("db connection failed ",err)
});
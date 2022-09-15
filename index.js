import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import { userRouter } from "./Routers/users.js";
import { carsRouter } from "./Routers/cars.js";
import { initialData } from "./initialData.js";


const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 4000;

// console.log(process.env);
const mongo_URL = process.env.Mongo_URL;

async function createConnection(){
    const client = new MongoClient(mongo_URL);
    await client.connect();
    console.log("MongoDB is connected");
    return client;
}

export const client = await createConnection();

app.use("/users",userRouter);
app.use("/cars",carsRouter);
 
// await client.db("car-rentals").collection("cars").insertMany(initialData);   Dont uncomment this.

app.listen(port,()=>console.log(`App is started in port ${port}`));
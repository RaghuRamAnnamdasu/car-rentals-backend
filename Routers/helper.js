import { client } from "../index.js";

export async function getUserByName(email) {
    return await client.db("car-rentals").collection("users").findOne({email : email});
  }

export async function createUSer(data) {
return await client.db("car-rentals").collection("users").insertOne(data);
}
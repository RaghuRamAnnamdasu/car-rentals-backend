import { ObjectID } from "bson";
import express, { request } from "express";
import {client} from "../index.js";
import Stripe from 'stripe';
const stripe = new Stripe('sk_test_51LSahvSIYNroY1eRa1OWsxkjQvw2IBqXWbnVJjVMCYmHIb3sjHiFrUJ0ZdbWzBT5JXs4FtTiyppblcRhg31TDFrH00bhTMbTeg');
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.get("/getAllCars", async (req,res)=>{
    const carsData = await client.db("car-rentals").collection("cars").find({}).toArray();
    res.send(carsData);
})


router.get("/getCarById/:id", async (req,res)=>{
    console.log(req.params)
    const {id} = req.params;
    const carDetails = await client.db("car-rentals").collection("cars").find({_id : ObjectID(id)}).toArray();
    res.send(carDetails[0]);
})


router.post("/rentCar", async (req,res)=>{
    try{
    const {token} = req.body;
    const bookedData = req.body;
    console.log("bookedData",bookedData)
    const customer = await stripe.customers.create({
        email: token.email,
        source: token.id
      });

    //   console.log(req.body,"totalAmount:", req.body.totalAmount);

    // const payment = await stripe.charges.create({
    //     amount : req.body.totalAmount * 100,
    //     currency : "inr",
    //     customer : customer.id,
    //     receipt_email : token.email
    // },{
    //     idempotencyKey : uuidv4()
    // });

    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.totalAmount * 100,
        currency: 'inr',
        payment_method_types: ['card'],
        customer : customer.id,
        receipt_email : token.email
      });


    if(paymentIntent){
        console.log("paymentIntent", paymentIntent)
        req.body.transactionId = paymentIntent.id;
        // console.log(req.body);
        const bookedDataResult = await client.db("car-rentals").collection("bookedData").insertOne(bookedData);
        const carId = bookedData.carId;
        const slotObject = bookedData.bookedTimeSlots;
        const slotObjectSavedResult = await client.db("car-rentals").collection("cars").updateOne({_id : ObjectID(carId)},{$push : {bookedTimings : slotObject}});
        res.send({message : "Booking Details Successfully updated", type : "success"});
    }else{
        res.status(400).send({message : error.message, type : "error"});
    }
    }catch(error){
        res.status(400).send({message : error.message, type : "error"});
    }
})


router.get("/:userId/getBookedCars", async (req,res)=>{
    console.log(req.params)
    const {userId} = req.params;
    const bookedDetails = await client.db("car-rentals").collection("bookedData").find({userId : userId}).toArray();
    res.send(bookedDetails);
})



router.post("/admin/addCar", async (req,res)=>{
    const carObject = req.body;
    const result = await client.db("car-rentals").collection("cars").insertOne(carObject);
    res.send({message : "Car added successfully", result});
})


router.put("/admin/editCar/:carId", async (req,res)=>{
    const {carId} = req.params;
    const carObject = req.body;
    delete(carObject._id);
    console.log(carObject);
    const result = await client.db("car-rentals").collection("cars").replaceOne({_id : ObjectID(carId)},carObject);
    res.send({message : "Car details saved successfully", result});
})


router.put("/admin/deleteCar/:carId", async (req,res)=>{
    const {carId} = req.body;
    console.log(carId);
    const result = await client.db("car-rentals").collection("cars").deleteOne({_id : ObjectID(carId)});
    res.send({message : "Car deleted successfully", result});
})


export const carsRouter = router;   
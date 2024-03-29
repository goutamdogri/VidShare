// require('dotenv').configure({path: './env'}) // "require" code ka consistency ko kharap kar raha hai. packege.json mai bhi script mai dev key ka  command value ko change karna parta hai tabhi run hota hai.
import dotenv from 'dotenv';
import connectDB from './db/index.js';
import { app } from './app.js';

dotenv.config({
    path: './.env'
})

connectDB()
.then(()=> {
    app.on("errror", (error) => { // event listner
        console.log("ERRR: ", error);
        throw error
    })
    
    app.listen(process.env.PORT || 8000, () => {
        console.log(`server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!!", err);
})


/* another approach in production -
import express from "express"
const app = express()

// first bracket ke andar function likha jata hai. second bracket mai jo bhi likha hoga o iske baad turant execute ho jayega. "ifec". iss line ke  first mai semi colon isiliye likha jata hai taki agar previous line mai semi lagaya to bhi koi diggat na ho.
( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("errror", (error) => {
            console.log("ERRR: ", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })

    } catch (error) {
        console.error("ERROR: ", error)
        throw err
    }
})()

*/
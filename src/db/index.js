import mongoose from "mongoose";
import { DB_NAME } from "../constents.js"

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongoDB connected!! DB HOST: ${connectionInstance.connection.host}`); // "\n" means next line. janhape connect hua hai uska url log hoga inhape.
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        process.exit(1) // process node ke andar ka method hai. see docs.
    }
}

export default connectDB
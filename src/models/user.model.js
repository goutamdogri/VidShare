import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true, 
        index: true // yeh data field ko searchable banata hai optimized tarike se. but toda expensive hoga yeh. 
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String, // cloudnary url
        required: true,
    },
    coverImage: {
        type: String, // cloudnary url
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    refreshToken: {
        type: String
    }
    
}, {timestamps: true})

 // "pre" is a hook middleware exists in mongoose. "save" event ka just pahle yeh code run hoga. idhar fat arrow function mat use karna qki uske andar "this" ka context nahi pata hota.
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt(this.password, 10)
    next()
})


// "method" userSchema ke andar ak object hai. usme hum property add kar rahe hai "isPasswordCorrect" name se. jisme value ak method hai
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

// inhape hum access token generate kar rahe hai 
userSchema.methods.generateAcessToken = function(){
    return jwt.sign( // access token return karega
        { // paylod
            _id: this._id, //database ka access hoga iske paas udhar se le lega
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

// inhape hum refresh token generate kar rahe hai. token making process same hota hai. inhape hum sirf payload kam dete hai
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign( // access token return karega
        { // paylod
            _id: this._id, //database ka access hoga iske paas udhar se le lega
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model('User', userSchema);
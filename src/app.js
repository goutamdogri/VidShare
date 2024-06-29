import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

//configurations
// app.use this method is use for middleware and for configuration purpose. inhape hum cors ko configure karenge kon kon port allowed hai yeh sab
app.use(cors({
    origin: [process.env.CORS_ORIGIN, process.env.SEC_CORS_ORIGIN],
    credentials: true
}))

// hum json ko accept karenge as response uske liye yeh configuration jaroori hai. json file 16kb ke andar hona chahiye tabhi accept karenge.
app.use(express.json({limit: "16kb"}))
// url ka data ko lene ke liye configuration. extended true karne se - object ke andar object de pate ho.
app.use(express.urlencoded({extended: true, limit:"16kb"}))
// public asset configure karne ke liye. unhase sara file koibhi(others files in our project) le sakta hai
app.use(express.static("public"))
// configuration taki hum user ke coockies mai data securely store kar paye
app.use(cookieParser())

// routes
import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'
import playlistRouter from './routes/playlist.routes.js'
import likeRouter from './routes/like.routes.js'
import dislikeRouter from './routes/dislike.routes.js'
import commentRouter from './routes/comment.routes.js'
import communityRouter from './routes/communityPost.routes.js'
import subscriptionRouter from './routes/subscription.routes.js'
import dashboardRouter from './routes/dashboard.routes.js'
import healthcheckRouter from './routes/healthcheck.routes.js'
import previewRouter from "./routes/preview.routes.js";
import feedbackRouter from "./routes/feedback.routes.js"

// routes declaration
app.use('/api/v1/users', userRouter) //middleware use is must. "/api/v1/user" pe control userRouter pe chala jayega. "/api/v1/users" is prefix and userRouter's url is come after that. '/api/v1/users/register'. api and uska version as a route likhna standard practice hai. 
app.use('/api/v1/videos', videoRouter)
app.use('/api/v1/playlist', playlistRouter)
app.use('/api/v1/likes', likeRouter)
app.use('/api/v1/dislikes', dislikeRouter)
app.use('/api/v1/comments', commentRouter)
app.use('/api/v1/community', communityRouter)
app.use('/api/v1/subscriptions', subscriptionRouter)
app.use('/api/v1/dashboard', dashboardRouter)
app.use('/api/v1/healthcheck', healthcheckRouter)
app.use('/api/v1/preview', previewRouter)
app.use('/api/v1/feedback', feedbackRouter)

// TEST routes
import routerForTest from './TEST/routesForTest.test.js'

app.use('/api/v1/test', routerForTest)


// TEST


export { app }
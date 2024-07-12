import "dotenv/config";
import express from "express";
import { Request, Response, NextFunction } from "express";
import connectDB from "./config/connectDb";
import mongoose from "mongoose";
import userRoute from "./router/user.route";
import error from "./middleware/error";
import cookieParser from "cookie-parser";
import cors from 'cors'
import {v2 as cloudinary} from 'cloudinary'
import homeRoute from "./router/homepage.route";
const app = express();


//Database
connectDB();


//config cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
})

// var corsOptions = function(req:Request, res:Response, next: NextFunction){ 
//   res.header('Access-Control-Allow-Origin', '*'); 
//   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
//   res.header('Access-Control-Allow-Headers', 
//   'Content-Type, Authorization, Content-Length, X-Requested-With');
//    next();
// }


var corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(cors(corsOptions))
app.use(express.json({limit: '50mb'}))
app.use(cookieParser())

app.use('/api/v1/user', userRoute)
app.use('/api/v1/layout', homeRoute)

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("Hello");
});

mongoose.connection.once("open", () => {
  app.listen(process.env.PORT || 5050, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
});


app.use(error)
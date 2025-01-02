import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./db/index.js";
import userRouter from "./routes/user.route.js";
import seatBooking from "./routes/seatBooking.route.js";


const app = express();

// Connect to PostgreSQL
connectDB();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({
  limit: "100mb",
}));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(express.static("public"));

// Routes
app.use("/api/users", userRouter,);
app.use("/api/",seatBooking)

export default app;

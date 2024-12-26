const express = require("express");
const todoRoute = require("./routes/todoRoute");
const userRoute = require("./routes/userRoute");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const { connectMongoDB } = require("./dbConnection");
const { authenticate } = require("./middlewares/authentication");

connectMongoDB("mongodb://127.0.0.1:27017/todoListDb");

const app = express();
const PORT = 3001;
app.use(
  cors({
    origin: "http://localhost:3000", // Client's URL
    credentials: true, // Allow cookies to be sent
  })
);
app.use(cookieParser());

app.use(express.urlencoded({ extended: false })); // Corrected here
app.use(express.json());

app.use("/", userRoute);

app.use(authenticate);

app.use("/api/todo", todoRoute);

app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));

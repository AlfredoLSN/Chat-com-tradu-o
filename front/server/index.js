const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

const mongoURI = "mongodb://mongo:sFvLbFdDFFXRtuIpAzKDBoufAjvMfwHC@autorack.proxy.rlwy.net:27452";

// Conectar ao MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Conectado ao MongoDB com sucesso!");
    })
    .catch((err) => {
        console.error("Erro ao conectar ao MongoDB:", err);
    });


const userRoutes = require("./routes/UserRoute");

app.use("/api",userRoutes);


app.listen(3000, ()=>{
    console.log("Server is running on port 3000");
});
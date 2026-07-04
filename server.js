require('dotenv').config();
const express = require('express');
const cors = require('cors');


const app= express();
const PORT = process.env.PORT || 3000;


app.get("/",(req,res)=>res.send("server is running"));

app.listen(PORT, ()=>{
    console.log(`server is running on port http://localhost:${PORT}`);
})

module.exports = app;
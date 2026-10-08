if (process.env.NODE_ENV != "production") {

    require('dotenv').config()
}

const express = require('express')
const { createServer } = require("node:http")

const cors = require('cors')
const mongoose = require('mongoose');
const connectToSocket = require("./controllers/socketManager.js")
const router = require("./routes/user.js")                           
const app = express() 
const port = 3000;

const server = createServer(app);
const io = connectToSocket(server)


app.use(cors()); 
app.use(express.json({limit: "40kb"}))
app.use(express.urlencoded({limit: "40kb", extended: true}))

app.use("/api/v1/users", router);

const dburl = process.env.ATLASDB_URL; 

main().then((res) => {
    console.log("DB Connected Successfully")
})
.catch(err => console.log(err)); 
 
async function main() {
  await mongoose.connect(dburl);   
} 


app.get('/', (req, res) => {
    res.send('Hello World!')
})

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
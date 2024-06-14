const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { ksrtcmodel } = require("./models/ksrtc")
const { busmodel } = require("./models/bus")

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect("mongodb+srv://ebinthomas01:ebinthomas01@cluster0.te6dmsx.mongodb.net/ksrtcDB?retryWrites=true&w=majority&appName=Cluster0")

const generateHashedPass = async (password) => {
    const salt = await bcryptjs.genSalt(10)
    return bcryptjs.hash(password, salt)
}

app.post("/signup", async (req, res) => {
    let input = req.body
    let HashedPass = await generateHashedPass(input.password)
    console.log(HashedPass)
    input.password = HashedPass
    let ksrtc = new ksrtcmodel(input)
    ksrtc.save()
    res.json({ "status": "success" })
})

app.post("/signin", (req, res) => {
    let input = req.body
    ksrtcmodel.find({ "email": req.body.email }).then(
        (response) => {
            if (response.length > 0) {
                let dbPassword = response[0].password
                console.log(dbPassword)
                bcryptjs.compare(input.password, dbPassword, (error, isMatch) => {
                    if (isMatch) {
                        jwt.sign({ email: input.email }, "ksrtc-app", { expiresIn: "1d" },
                            (error, token) => {
                                if (error) {
                                    res.json({ "status": "Unable to create token" })
                                }
                                else {
                                    res.json({ "status": "success", "name": response[0]._id, "token": token })
                                }
                            }
                        )
                    }
                    else {
                        res.json({ "status": "Incorrect Password" })
                    }
                })
            }
            else {
                res.json({ "status": "User not Found" })
            }
        }
    ).catch()
})

app.post("/view", (req, res) => {
    let token = req.headers["token"]
    jwt.verify(token, "ksrtc-app", (error, decoded) => {
        if (decoded) {
            ksrtcmodel.find().then(
                (response) => {
                    res.json(response)
                }
            ).catch()
        }
        else {
            res.json({ "status": "Un-Authorised Access" })
        }
    })

})



app.post("/add", async (req, res) => {
    let input = req.body
    let bus = new busmodel(input)
    await bus.save()
    console.log(bus)
    res.json({"status":"success"})
})

app.post("/search", (req, res) => {
    let input = req.body
    busmodel.find(input).then(
        (data) => {
            res.json(data)
        }
    ).catch(
        (error) => {
            res.json(error)
        }
    )
})

app.get("/viewemp", (req, res) => {
    busmodel.find().then(
        (data) => {
            res.json(data)
        }
    ).catch(
        (error) => {
            res.json(error)
        }
    )
})

app.post("/delete", (req, res) => {
    let input = req.body
    busmodel.findByIdAndDelete(input._id).then(
        (response) => {
            res.json({ "status": "success" })
        }
    ).catch(
        (error) => {
            res.json({ "status": "error" })
        }
    )
})


app.listen(8080, () => {
    console.log("Server Running")
})




const { status } = require("http-status");

const User = require("../models/userModel.js");

const bcrypt = require("bcrypt");

const crypto = require("crypto");

const Meeting =  require("../models/meetingModel.js");


module.exports.login = async (req, res) => {


    const { username, password } = req.body;



    if (!username || !password) {

        

        return res.status(400).json({
            message: "Please Provide"
        });
    }


    try {

        

        const user = await User.findOne({
            username: username
        });
   

        if (!user) {

            return res.status(status.NOT_FOUND).json({
                message: "User not found"
            });
        }


    

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );


        

        if (!isPasswordCorrect) {

            return res.status(401).json({
                message: "Invalid username or password"
            });
        }

        const token = crypto.randomBytes(20).toString("hex");

        user.token = token;

        await user.save();

        return res.status(status.OK).json({
            token: token,
            message: "Login successfully"
        });


    } catch (err) {

        return res.status(500).json({
            message: `Something went wrong ${err}`
        });
    }
};

module.exports.register = async (req, res) => {

    const {
        name,
        username,
        password
    } = req.body;


    try {

        const existingUser = await User.findOne({
            username: username
        });

        if (existingUser) {

            return res.status(status.CONFLICT).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const newUser = new User({

            name: name,

            
            username: username,
            password: hashedPassword
        });

        await newUser.save();

        return res.status(status.CREATED).json({
            message: "User registered"
        });


    } catch (err) {

        return res.status(500).json({
            message: `Something went wrong ${err}`
        });
    }
};



module.exports.getUserHistory = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ token: token });
        const meetings = await Meeting.find({ user_id: user.username })
        res.json(meetings)
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}



module.exports.addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;

    try {
        const user = await User.findOne({ token: token });

        const newMeeting = new Meeting({
            user_id: user.username,
            meetingCode: meeting_code
        })

        await newMeeting.save();

        res.status(status.CREATED).json({ message: "Added code to history" })
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}


module.exports.deleteHistory = async (req, res) => {

    const { token, id } = req.body;

    try {
        const user = await User.findOne({
            token: token
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const result = await Meeting.deleteOne({
            _id: id,
            user_id: user.username
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                message: "History not found"
            });
        }

      
        return res.status(200).json({
            message: "History deleted successfully"
        });

    } catch (e) {

        console.log("Delete Error:", e);

        return res.status(500).json({
            message: `Something went wrong ${e}`
        });
    }
};
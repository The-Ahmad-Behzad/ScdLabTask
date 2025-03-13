import express from 'express';
import mongoose from "mongoose";
import jwt from "jsonwebtoken"
const app = express();
const port = process.env.PORT || 3002;

// Model
const userSchema = new mongoose.Schema({
    name: {type:String, required:true},
    email: {type:String, required:true, unique:true},
    password:{type:String, required:true},
    maxBookings:{type:Number, default:3},
    activeBookings:{type:Number, default:0},
    bookings:{type: Array, default:[]},
})

const userModel = mongoose.models.user|| mongoose.model('user', userSchema)

const eventSchema = new mongoose.Schema({
    name: {type:String, required:true},
    description: {type:String, default:"This is an Event"},
    date:{type:Date, default:Date.now()},
    userId: { type: mongoose.Schema.ObjectId, ref: 'user', required: true },
    category:{type:String, Default:"General"}
})

const eventModel = mongoose.models.event|| mongoose.model('event', eventSchema)


export { userModel, eventModel }

const connectDB = async () => {
    mongoose.connection.on('connected',()=>console.log("Database Connected"))
    await mongoose.connect(`mongodb+srv://ahmad-behzad:Md1tbfmulaaso1aas1gh%21@cluster0.q90ww.mongodb.net/SCD_Lab_2?retryWrites=true&w=majority&appName=Cluster0`)
}

connectDB();


app.post('/events', async (req, res) => {
    try {
        const { name, userId, description, date } = req.body

        if (!name || !userId) {
            return res.status(400).json({ success: false, message: "Please fill all required fields" })
        }

        const eventData = {
            name,
            userId,
            description,
            date
        }

        const newEvent = new eventModel(eventData)
        const event = await newEvent.save()
        
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

});

app.put('/events/:userId', async (req, res) => {
        try {
            const { userId } = req.params; 
            const { category } = req.body
            const event = eventModel.find({ userId })
            
            if (!event) {
                res.json({ success: false, message: "Invalid user ID" })
            }
    
            if (!category) {
                res.json({ success: false, message: "New Category value not given" })
            }
    
            await eventModel.findByIdAndUpdate(id, {
                category
            })
            res.json({ success: true, event })
        } catch (error) {
            console.log(error)
            res.json({ success: false, message: error.message })
        }
    });

app.put('/events/:id', async (req, res) => {
        try {
            const { id } = req.params; 
            const event = eventModel.find({ id })
            
            if (!event) {
                res.json({ success: false, message: "Invalid user ID" })
            }

            
            res.json({ success: true, reminder:`This event is due on ${event.date}` })
        } catch (error) {
            console.log(error)
            res.json({ success: false, message: error.message })
        }
    });

app.get('/events', async (req, res) => {
        try {
            const { sortBy, userId } = req.params
            const user = await userModel.find({ userId})
            if (!user) {
                res.json({ success: false, message: "Invalid user ID" })
            }
            const events = await eventModel.find({ userId})
            if (!events) {
                res.json({ success: false, message: "No Events Found" })
            }
            var sortedEvents = events
            if (sortBy === "date") {
                sortedEvents = events.sort(({date:a}, {date:b}) => b-a)   
            }
            else if (sortBy === "category") {
                sortedEvents = events.sort((a, b) => {return (a.category > b.category) ? 1 : ((b.category > a.category) ? -1 : 0);})   
            }
            else if (sortBy === "reminder") {
                sortedEvents = events.sort((a, b) => {return (a.category > b.category) ? 1 : ((b.category > a.category) ? -1 : 0);})   
            }


            res.json({ success: true, events })
        } catch (error) {
            console.log(error)
            res.json({ success: false, message: error.message })
        }
    });

app.post('/users', async (req, res) => {
    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Please fill all fields" })
        }


        //validating email
        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: " Enter a Valid Email" })
        }


        //validating password
        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be atleast 8 characters" })
        }

        //hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()
        //_id
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
        res.status(201).json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

});

app.post('/users/login', async (req, res) => {
    try {
        const { token } = req.body

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Please fill all fields" })
        }


        //validating email
        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: " Enter a Valid Email" })
        }

        let jwtSecretKey = process.env.JWT_SECRET_KEY;

        const verified = jwt.verify(token, jwtSecretKey);
        if (verified) {
            return res.send("Login Successful");
        } else {
            return res.status(401).send(error);
        }


    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

});


app.get('/users/:id', async (req, res) => {
    try {
        const { id } = req.params; 
        const user = await userModel.find({ id })
        res.json({ success: true, user })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
});

app.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params; 
        const { actionType, carId } = req.body
        const user = userModel.find({ id })
        var activeBookings = user.activeBookings
        var bookings = user.bookings

        if (actionType === "CREATE") {
            activeBookings++
            bookings.push(carId)
        } else if (actionType === "CANCEL") {
            activeBookings--
            bookings = []
            user.bookings.array.forEach(element => {
                if (element !== carId ) {
                    bookings.push(element)
                }
            });            
        }

        await userModel.findByIdAndUpdate(id, {
            activeBookings,
            bookings
        })
        res.json({ success: true, user })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
});

app.listen(port, () => {
    console.log(`Event Management listening on port ${port}`);
});
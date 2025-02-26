import express from "express";
const router = express.Router();
import Post from "../model/Post.js";
import User from "../model/User.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const adminLayout = "../views/layouts/admin.ejs";

// home
router.get("/admin", async (req, res) => {
    try {
        const locals = {    
            title: "Admin", 
            description: "This is my blogsite"
        }
        res.render("admin/Login.ejs", { locals, layout: adminLayout });
    } catch (error) {    
        console.error(error);
        res.status(500).send("Server Error"); // Handle errors properly
    }
})

// check - login
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if(!token){
        res.redirect("/admin");
        return;
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err){
            res.redirect("/admin");
            return;
        }
        req.userId = decoded.userId;
        next();
    })
}

// admin - user login
router.post("/admin", async (req, res) => {
    try {
        const{username, password} = req.body;
        const user = await User.findOne({username: username});
        if(!user){
            res.status(401).json({ message: "Invalid Credentials" });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            res.status(401).json({ message: "Invalid Credentials" });
            return;
        }

        const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET);
        res.cookie("token", token, {
            httpOnly: true
        });

        res.redirect("/dashboard");

    } catch (error) {    
        console.error(error);
        res.status(500).send("Server Error"); // Handle errors properly
    }
})



//get add-posts route

router.get("/add-post",authMiddleware ,async (req, res) => {
    try {
        const locals = {    
            title: "Add post", 
            description: "This is my blogsite"
        }

        
        res.render("admin/add-post.ejs", { locals, layout: adminLayout });
    } catch (error) {
        console.log(error);
    }
});


// post add-post route
router.post("/add-post", authMiddleware, async(req, res) => {
    try {        
        try {
            const newPost = new Post({
                title: req.body.title,
                body: req.body.body
            });

            await Post.create(newPost);
            res.redirect("/dashboard");
        } catch (error) {
            console.log(error);
        }
    } catch (error) {
        console.log(error);
    }
});


// get edit post
router.get("/edit-post/:id",authMiddleware ,async (req, res) => {    
    try {
        const locals = {    
            title: "Edit post", 
            description: "This is my blogsite"
        }
        const data = await Post.findById(req.params.id);
        res.render("admin/Edit-post", { locals, data, layout: adminLayout });
    } catch (error) {
        console.log(error);
    }   
}); 

// Put edit post
router.put("/edit-post/:id",authMiddleware ,async (req, res) => {
    try {
        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        });

        res.redirect("/edit-post/" + req.params.id);
    } catch (error) {
        console.log(error);
    }
});      

router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/admin");
    })

// admin-Dashboard
router.get("/dashboard", authMiddleware, async (req, res) => {
    try {
        const locals = {    
            title: "Dashboard", 
            description: "This is my blogsite"
        }
        const data = await Post.find();
        res.render("admin/Dashboard",{
            locals,
            data,
            layout: adminLayout
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }

});



// admin user-Register
router.post("/register", async (req, res) => {
    try {
        const{username, password} = req.body;
        const hashPassword = await bcrypt.hash(password, 10);

        try {
            const user = new User({
                username: username,
                password: hashPassword,
            });
            await user.save();
            res.status(201).json({ message: "User registered successfully", user });
        } catch (error) {
            if(error.code === 11000){
                res.status(409).json({ message: "User already exists" });
            }

            res.status(500).json({ message: "Internal server error" });
        }
        
    } catch (error) {    
        console.error(error);
        res.status(500).send("Server Error"); // Handle errors properly
    }
});

// delete admin posts
router.delete("/delete-post/:id", authMiddleware, async (req, res) => {
    try {
        await Post.deleteOne({_id: req.params.id});
        res.redirect("/dashboard");
    } catch (error) {
        console.log(error);
    }
});

router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});


export default router;
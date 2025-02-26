import express from "express";
const router = express.Router();
import Post from "../model/Post.js";


router.get("", async (req, res) => {
    
    try {
        const locals = {
            title: "Blogsite",
            description: "This is my blogsite"
        }

        let perPage = 10;
        let page = req.query.page || 1;


        const data = await Post.aggregate([ { $sort: { createdAt: -1 } } ])
        .skip((perPage * page) - perPage).limit(perPage)
        .limit(perPage)
        .exec();

        const count = await Post.countDocuments();
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);

        res.render("index", { 
            locals, 
            data,
            current: page,
            nextPage: hasNextPage? nextPage : null
         });
    } catch (error) {
        console.log(error);
    }
});

// function insertPost(req, res) {
//     Post.insertMany([
//         {
//             title: "Building a BLogsite",
//             body: "This is the body of the post",   
//         },
//         {
//             title: "New data",
//             body: "THis is also data for blogsite",
//         }

//     ]);
// }

// insertPost();

router.get("/Post/:id", async (req, res) => {
    try {
        const data = await Post.findById(req.params.id); // ✅ Corrected query

        if (!data) {
            return res.status(404).send("Post not found"); // Handle missing post
        }

        const locals = {
            title: data.title,
            description: "This is my blogsite"
        };

        res.render("Post", { locals, data });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error"); // Handle errors properly
    }
});



// post search route
router.post("/search", async (req, res) => {
    try {
        const locals = {
            title: "Search",
            description: "This is my blogsite"
        };

        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g, "");
        const data = await Post.find({ 
            $or: [
                {title: { $regex: new RegExp(searchNoSpecialChar, 'i' )}},
                {body: { $regex: new RegExp(searchNoSpecialChar, 'i' )}} // { $regex: searchTerm, "i" }}
            ]
        });
        res.render("search", { data , locals});
    } catch (error) {
        console.log(error);
    }
});



router.get("/about", (req, res) => {
    res.render("about");
})

router.get("/contact", (req, res) => {
    res.render("contact");
})

export default router;

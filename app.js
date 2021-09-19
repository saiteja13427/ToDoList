const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

mongoose.connect("mongodb+srv://admin_sai:test123@cluster0.ysfhq.mongodb.net/todoDB", {useNewUrlParser: true});


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//Main list on home page
const mainSchema = {
    name: String
};

const MainList = mongoose.model("mainList", mainSchema);

const item1 = new MainList({
    name: "Blog"
})

const item2 = new MainList({
    name: "Webdev"
})

//All the sublists which can we created on any /<> route
const subListSchema = {
    name: String,
    tasks: [mainSchema]
};

const SubList = mongoose.model("subList", subListSchema);


app.get("/", function(req, res){

    //Adding a few items to main list if it is empty
    MainList.find({}, function(err, mainItems){
        if (mainItems.length == 0) {
            MainList.insertMany([item1, item2], function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Success");
                }
            });
            res.redirect("/");
        }
        //Rendering list.ejs and passing variabless into the template
        res.render("list", {listName: "Today", newTask: mainItems, listType: "/"});
    });
    
    
})
//Post route to add tasks for main list and sublists as well
app.post("/", function(req, res){

    //Getting the list name and the task to be added
    var task = req.body.task;
    var list = req.body.list;

    const newTask = new MainList({
        name: task
    })
    //If it is mainlist the just save
    if (list == "Today") {
        newTask.save();
        res.redirect("/")    
    }else{
        //If it is a sublist then find it and push the task in taskarray in it
        SubList.findOne({name: list}, function (err, subListItems) {
            subListItems.tasks.push(newTask);
            subListItems.save();
        })
        res.redirect("/"+list);
    }
    
})

//Delete route for delete tasks from main and sub list
app.post("/delete", function(req, res){
    var task = req.body.checkbox;
    var list = req.body.list;
    //Delete is not executed until you have a callback function
    //Delete if the list is main list
    if (list=="Today") {
        MainList.deleteOne({_id: task}, function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Success");
            }
        });
        res.redirect("/")
    } else {
        //If it is a sub list then find it and $pull the task with id which we got from frontend.
        SubList.findOneAndUpdate({name: list}, {$pull: {tasks:{_id: task}}}, function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Success");
            }
        });
        res.redirect("/"+list);
    }
    
})

//Get route for the sublists
app.get("/:listName", function(req, res){
    //Create document here so that you can direclty update it in post route!!
    const listName = _.capitalize(req.params.listName);
    SubList.find({name: listName}, function(err, subListItems) {
        //Creating a document with the list name and adding default tasks
        if(subListItems.length==0){
            const list = new SubList({
                name: listName,
                tasks: [{name: 'blog'}, {name: 'webdev'}]
            })
            list.save();
            res.redirect("/"+listName);
        }else{
            //If the list already exists then simply rendering it
            res.render("list", {listName: listName, newTask: subListItems[0].tasks, listType: "/"+listName});
        }
    }); 
});




app.listen(process.env.PORT || 3000, function(){
    console.log("Hey I am running at 3000 port");
})

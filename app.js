//jshint esversion: 6
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");
mongoose.set('useFindAndModify', false);

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-saurabh:Barney%23123@cluster0.2rsu6.mongodb.net/todolistDB",{useNewUrlParser : true, useUnifiedTopology: true});

const itemsSchema = {
    name: String
};
const listSchema = {
    name: String,
    items: [itemsSchema]
}
const Item = mongoose.model("Item",itemsSchema);
const List = mongoose.model("List",listSchema);
const item1 = new Item({
    name:"Hello! Welcome to you todolist"
})

const item2 = new Item({
    name:"Hit the + button to add an item to the list"
})

const item3 = new Item({
    name:"<------- Click this to delete an item from the list"
})

const defaultItems = [item1,item2,item3];


app.get("/",function(req,res){
    Item.find({},function(err,foundItems){
        if(foundItems.length===0){
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Inserted default items!");
                }
            })
        }
        res.render("list",{listTitle : "Today",newListItems : foundItems});
    })
});

app.get("/:customListName",function(req,res){
    customListName = _.capitalize(req.params.customListName);

    List.findOne({name:customListName} ,function(err,foundList){
        if(err){
            console.log(err);
        }
        else{
            if(!foundList){
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })
                list.save();
                res.redirect("/"+customListName);
            }
            else{
                res.render("list",{listTitle : foundList.name,newListItems : foundList.items});
            }
        }
    })

})


app.get("/about",function(req,res){
    res.render("about");
})
app.post("/delete",function(req,res){
    const checkedItemId = req.body.checkbox;
    const targetItem = req.body.targetItem;
    const listName = req.body.listName;
    if(listName === "Today"){
    Item.findByIdAndRemove(targetItem,function(err){
            if(err){
                console.log(err);
            }
            else{
                console.log("Deleted Item successfully!");
            }
        });
        res.redirect("/");
    }
    else{
        List.findOneAndUpdate({name: listName},{$pull: {items : {_id : targetItem}}},{new:true} ,function(err,foundList){
            if(err){
                console.log(err);
            }
            else{
                res.redirect("/" + listName);
            }
        });
    }
    
    
});
app.post("/",function(req,res){
    console.log(req.body);
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const  item = new Item({
        name: itemName
    });
    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name:listName},function(err,foundList){
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);
        })
    }
})
app.post("/work",function(req,res){
    workItems.push(req.body.newItem);
    res.redirect("/work");
})
app.listen(process.env.PORT || 3000,function(){
    console.log("listening on port 3000");
});

//File: controllers/main_controller.js
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

// GET /user
exports.signupForm = function(req, res) {
    var errors = req.session.errors || {};
    console.log("Error: " + errors.message);
    req.session.errors = {};
    res.render('user/new', {errors: errors});
};

//POST - Insert a new Participant in the DB
exports.signup = function(req, res) {  
    console.log('POST');
    console.log(req.body);
    if (req.body.login && req.body.password && req.body.group && req.body.confirmpassword) {
        var participant = {
            name: req.body.login,
            password: req.body.password,
            groupId: req.body.group,
            date: "",
            maxPrice: "",
            presents: [],
            invisibleMessages: [],
            visibleMessages: []
        };
        if (req.body.password !== req.body.confirmpassword) {
            req.session.errors = {"message": 'Las contraseñas no coinciden'};
            console.log(req.session.errors);
            console.log(req.session.errors.message);
            res.redirect('/user');
        } else {
            MongoClient.connect(url, function(err, db) {
                if (err) return res.status(500).send(err.message); // Internal Server Error
                var dbo = db.db("invisiblefriend");
                var query = { groupId: req.body.group };
                dbo.collection("users").find(query).toArray(function(err, result) {
                    if (err) return res.status(500).send(err.message); // Internal Server Error
                    console.log('GET /participants');
                    if (result.length>0 && result[0].visible) {
                        db.close();
                        req.session.errors = {"message": 'Este grupo ya ha cerrado el sorteo'};
                        console.log(req.session.errors);
                        console.log(req.session.errors.message);
                        res.redirect('/user');
                        return;
                    } else {
                        var query = { name: req.body.login, groupId: req.body.group }
                        dbo.collection("users").findOne(query, function(err, existent) {
                            if(err) {
                                req.session.errors = {"message": 'Se ha producido un error: '+err};
                                console.log(req.session.errors.message);
                                res.redirect('/user');
                                return;
                            }
                            if (existent) {
                                req.session.errors = {"message": 'Este usuario ya existe'};
                                console.log(req.session.errors);
                                console.log(req.session.errors.message);
                                db.close();
                                res.redirect('/user');
                                return;
                            } else {
                                dbo.collection("users").insertOne(participant, function(err, result) {
                                    if (err) { // Internal Server Error
                                        req.session.errors = {"message": 'Se ha producido un error: '+err};
                                        res.redirect("/user");        
                                        return;
                                    }
                                    req.session.user = {id:participant._id, username:participant.name, group:participant.groupId};
                                    console.log(req.session.user);
                                    console.log(req.session.user.id);
                                    console.log(req.session.user.username);
                                    db.close();
                                    res.redirect('/participants');
                                });
                            }
                        });
                    }
                });
            });
        }
    } else {
        req.session.errors = {"message": 'Rellena los campos'};
        console.log(req.session.errors);
        console.log(req.session.errors.message);
        res.redirect('/user');
    }
};



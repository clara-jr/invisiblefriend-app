//File: controllers/main_controller.js
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var url = "mongodb://localhost:27017/";

//GET - Return all participants in the DB
exports.findAll = function(req, res) {  
    if (req.session.user.id.length != 24) {
        res.status(404).send('Participant inexistent');
    } else {
        MongoClient.connect(url, function(err, db) {
            if (err) return res.status(500).send(err.message); // Internal Server Error
            var dbo = db.db("invisiblefriend");
            var query = { groupId: req.session.user.group };
            dbo.collection("users").find(query).toArray(function(err, result) {
                if (err) return res.status(500).send(err.message); // Internal Server Error
                console.log('GET /participants');
                var query = { _id: ObjectId(req.session.user.id) };
                dbo.collection("users").findOne(query, function(err, participant) {
                    if(err) return res.status(500).send(err.message);
                    console.log('GET /participants');
                    console.log(participant.visible);
                    if (participant.visible && participant.visible !== "reset") {
                        console.log(participant.visible);
                        var query = { _id: ObjectId(participant.visible) };
                        dbo.collection("users").findOne(query, function(err, amigo) {
                            if(err) return res.status(500).send(err.message);
                            console.log('GET /chat');
                            db.close();
                            res.render('participants/index', {model: result, amigo: amigo, date: participant.date, maxPrice: participant.maxPrice});
                        });
                    } else {
                        db.close();
                        res.render('participants/index', {model: result});
                    }
                });
            });
        });
    }
};

//GET - Return a Participant with specified ID
exports.findById = function(req, res) {  
    if (req.params.modelId.length != 24) {
        res.status(404).send('Participant inexistent');
    } else {
        var errors = req.session.errors || {};
        req.session.errors = {};
        MongoClient.connect(url, function(err, db) {
            if (err) return res.status(500).send(err.message); // Internal Server Error
            var dbo = db.db("invisiblefriend");
            var query = { _id: ObjectId(req.params.modelId) };
            dbo.collection("users").findOne(query, function(err, result) {
                if (err) return res.status(500).send(err.message); // Internal Server Error
                console.log('GET /participants/' + req.params.modelId);
                db.close();
                res.render('participants/show', {participant: result, errors: errors});
            });
        });
    }
};

//PUT - Insert a new Present in a Participant
exports.addPresentToParticipant = function(req, res) {  
    var modelId = req.params.modelId;
    if (modelId.length != 24) {
        res.status(404).send('Participant inexistent');
    } else {
        if (req.body.idea) {
            MongoClient.connect(url, function(err, db) {
                if (err) return res.status(500).send(err.message); // Internal Server Error
                var dbo = db.db("invisiblefriend");
                var query = { _id: ObjectId(modelId) };
                dbo.collection("users").findOne(query, function(err, result) {
                    if (err) return res.status(500).send(err.message); // Internal Server Error
                    var count = result.presents.length;
                    console.log('ADD Present: ' + count);
                    var values = { $push: { presents: { _id: ObjectId(), idea: req.body.idea, user: req.session.user.username } } };
                    dbo.collection("users").updateOne(query, values, function(err, result) {
                        if (err) return res.status(500).send({error: err.message}); // Internal Server Error
                        console.log("1 document updated");
                        db.close();
                        res.redirect('/participants/'+modelId);
                    });
                });
            });
        } else {
            req.session.errors = {"message": 'Rellena el campo'};
            res.redirect('/participants/'+modelId);
        }
    }
}

//DELETE - Delete a Present of a Participant
exports.deletePresentOfParticipant = function(req, res) {  
    var modelId = req.params.modelId;
    var presentId = req.params.presentId;
    if (modelId.length != 24) {
        res.status(404).send('Participant inexistent');
    } else if (presentId.length != 24) {
        res.status(404).send('Present inexistent');
    } else {
        MongoClient.connect(url, function(err, db) {
            if (err) return res.status(500).send(err.message); // Internal Server Error
            var dbo = db.db("invisiblefriend");
            var query = { _id: ObjectId(modelId) };
            dbo.collection("users").findOne(query, function(err, result) {
                if (err) return res.status(500).send(err.message); // Internal Server Error
                if (result) {
                    var present = _id(result.presents, presentId);
                    if (present) {
                        var query = { _id: ObjectId(modelId) };
                        var values = { $pull: { presents: { _id: ObjectId(presentId) } } };
                        dbo.collection("users").updateOne(query, values, function(err, result) {
                            if (err) return res.status(500).send(err.message); // Internal Server Error
                            console.log("1 document updated");
                            db.close();
                            res.redirect('/participants/'+modelId);
                        });
                    } else {
                        db.close();
                        //res.status(404).send('Present inexistent');
                        res.redirect('/participants/'+modelId);
                    }
                } else {
                    db.close();
                    res.status(404).send('Participant inexistent');
                }
            });
        });
    }
}

//GET
exports.goSorteo = function(req, res) { 
    var errors = req.session.errors || {};
    console.log("Error: " + errors.message);
    req.session.errors = {};
    MongoClient.connect(url, function(err, db) {
        if (err) return res.status(500).send(err.message); // Internal Server Error
        var dbo = db.db("invisiblefriend");
        var query = { groupId: req.session.user.group };
        dbo.collection("users").find(query).toArray(function(err, result) {
            if (err) return res.status(500).send(err.message); // Internal Server Error
            console.log('GET /sorteo');
            db.close();
            res.render('participants/sorteo', {model: result, errors: errors});
        });
    });
};

//PUT
exports.createSorteo = function(req, res) {  
    var date = req.body.date;
    var maxPrice = req.body.maxprice;
    MongoClient.connect(url, function(err, db) {
        if (err) return res.status(500).send(err.message); // Internal Server Error
        var dbo = db.db("invisiblefriend");
        var query = { groupId: req.session.user.group };
        dbo.collection("users").find(query).toArray(function(err, model) {
            if (err) return res.status(500).send(err.message); // Internal Server Error
            console.log(model.length)
            // for each participant in model
            var modelrandom;
            modelrandom = shuffle(model);
            for (i = 0; i < modelrandom.length; i++) {
                if (i>0 && i<modelrandom.length-1) {
                    var query = { _id: ObjectId(modelrandom[i]._id) };
                    var values = { $set: { date: date, maxPrice: maxPrice, visible: modelrandom[i+1]._id, invisible: modelrandom[i-1]._id } };
                    dbo.collection("users").updateOne(query, values, function(err, result) {
                        if (err) return res.status(500).send(err.message); // Internal Server Error
                        console.log(result);
                        db.close();
                    });
                } else {
                    if (i !== modelrandom.length-1) {
                        var query = { _id: ObjectId(modelrandom[i]._id) };
                        var values = { $set: { date: date, maxPrice: maxPrice, visible: modelrandom[i+1]._id, invisible: modelrandom[modelrandom.length-1]._id } };
                        dbo.collection("users").updateOne(query, values, function(err, result) {
                            if (err) return res.status(500).send(err.message); // Internal Server Error
                            console.log(result);
                            db.close();
                        });
                    } else {
                        var query = { _id: ObjectId(modelrandom[i]._id) };
                        var values = { $set: { date: date, maxPrice: maxPrice, visible: modelrandom[0]._id, invisible: modelrandom[i-1]._id } };
                        dbo.collection("users").updateOne(query, values, function(err, result) {
                            if (err) return res.status(500).send(err.message); // Internal Server Error
                            console.log(result);
                            db.close();
                        });
                    }
                }
            }
            console.log('PUT /sorteo')
            res.redirect('/participants');
        });
    });
};

//GET
exports.goChat = function(req, res) {  
    var errors = req.session.errors || {};
    req.session.errors = {};
    MongoClient.connect(url, function(err, db) {
        if (err) return res.status(500).send(err.message); // Internal Server Error
        var dbo = db.db("invisiblefriend");
        var query = { _id: ObjectId(req.session.user.id) };
        dbo.collection("users").findOne(query, function(err, participant) {
            if (err) return res.status(500).send(err.message); // Internal Server Error
            console.log('GET /chat');
            if (participant.visible && participant.visible !== "reset") {
                var query = { _id: ObjectId(participant.visible) };
                dbo.collection("users").findOne(query, function(err, amigo) {
                    if(err) return res.status(500).send(err.message);
                    console.log('GET /chat');
                    db.close();
                    res.render('chat/index', {participant: participant, amigo: amigo, errors: errors});
                });
            } else {
                db.close();
                res.render('chat/index', {participant: participant, errors: errors});
            }
        });
    });
};

//PUT chat desde el usuario a su visible
exports.sendChatVisible = function(req, res) {  
    if (req.body.chat) {
        MongoClient.connect(url, function(err, db) {
            if (err) return res.status(500).send(err.message); // Internal Server Error
            var dbo = db.db("invisiblefriend");
            var query = { _id: ObjectId(req.session.user.id) };
            dbo.collection("users").findOne(query, function(err, participant) {
                if (err) {
                    req.session.errors = {"message": 'Se ha producido un error: '+err};
                    console.log(req.session.errors.message);
                    res.redirect('/chat');
                    return;
                }
                var query = { _id: ObjectId(participant._id) };
                var values = { $push: { visibleMessages: { _id: ObjectId(), text: req.body.chat, origin: true } } };
                dbo.collection("users").updateOne(query, values, function(err, result) {
                    if (err) return res.status(500).send(err.message); // Internal Server Error
                    console.log(result);
                });
                var query = { _id: ObjectId(participant.visible) };
                var values = { $push: { invisibleMessages: { _id: ObjectId(), text: req.body.chat, origin: false } } };
                dbo.collection("users").updateOne(query, values, function(err, result) {
                    if (err) return res.status(500).send(err.message); // Internal Server Error
                    console.log(result);
                });
                db.close();
                res.redirect('/chat');
            });
        });
    } else {
        req.session.errors = {"message": 'Rellena el campo'};
        console.log(req.session.errors);
        console.log(req.session.errors.message);
        res.redirect('/chat');
    }
};

//PUT
exports.sendChatInvisible = function(req, res) {  
    if (req.body.chat) {
        MongoClient.connect(url, function(err, db) {
            if (err) return res.status(500).send(err.message); // Internal Server Error
            var dbo = db.db("invisiblefriend");
            var query = { _id: ObjectId(req.session.user.id) };
            dbo.collection("users").findOne(query, function(err, participant) {
                if (err) {
                    req.session.errors = {"message": 'Se ha producido un error: '+err};
                    console.log(req.session.errors.message);
                    res.redirect('/chat');
                    return;
                }
                var query = { _id: ObjectId(participant._id) };
                var values = { $push: { invisibleMessages: { _id: ObjectId(), text: req.body.chat, origin: true } } };
                dbo.collection("users").updateOne(query, values, function(err, result) {
                    if (err) return res.status(500).send(err.message); // Internal Server Error
                    console.log(result);
                });
                var query = { _id: ObjectId(participant.invisible) };
                var values = { $push: { visibleMessages: { _id: ObjectId(), text: req.body.chat, origin: false } } };
                dbo.collection("users").updateOne(query, values, function(err, result) {
                    if (err) return res.status(500).send(err.message); // Internal Server Error
                    console.log(result);
                });
                db.close();
                res.redirect('/chat');
            });
        });
    } else {
        req.session.errors = {"message": 'Rellena el campo'};
        console.log(req.session.errors);
        console.log(req.session.errors.message);
        res.redirect('/chat');
    }
};

//DELETE
exports.deleteUser = function(req, res) {
    MongoClient.connect(url, function(err, db) {
        if (err) return res.status(500).send(err.message); // Internal Server Error
        var dbo = db.db("invisiblefriend");
        var query = { _id: ObjectId(req.session.user.id) };
        dbo.collection("users").remove(query, function(err, result) {
            if (err) return res.status(500).send(err.message);
            delete req.session.user;
            db.close();
            res.redirect('/');
        });
    });
};

//PUT
exports.resetGroupGame = function(req, res) {  
    MongoClient.connect(url, function(err, db) {
        if (err) return res.status(500).send(err.message); // Internal Server Error
        var dbo = db.db("invisiblefriend");
        var query = { groupId: req.session.user.group };
        dbo.collection("users").find(query).toArray(function(err, model) {
            if (err) return res.status(500).send(err.message); // Internal Server Error
            // for each participant in model
            for (i = 0; i < model.length; i++) {
                var query = { _id: ObjectId(model[i]._id) };
                var values = { $set: { visible: "reset", invisible: "reset" } };
                dbo.collection("users").updateOne(query, values, function(err, result) {
                    if (err) return res.status(500).send(err.message); // Internal Server Error
                    console.log(result);
                });
                for (j = 0; j < model[i].visibleMessages.length; j++) {
                    var query = { _id: ObjectId(model[i]._id) };
                    var values = { $pull: { visibleMessages: { _id: ObjectId(model[i].visibleMessages[j]._id) } } };
                    dbo.collection("users").updateOne(query, values, function(err, result) {
                        if (err) return res.status(500).send(err.message); // Internal Server Error
                        console.log(result);
                    });
                }
                for (j = 0; j < model[i].invisibleMessages.length; j++) {
                    var query = { _id: ObjectId(model[i]._id) };
                    var values = { $pull: { invisibleMessages: { _id: ObjectId(model[i].invisibleMessages[j]._id) } } };
                    dbo.collection("users").updateOne(query, values, function(err, result) {
                        if (err) return res.status(500).send(err.message); // Internal Server Error
                        console.log(result);
                    });
                }
            }
            db.close();
            res.redirect('/participants');
        });
    });
};

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

_id = function(array, id) {
    var i = 0;
    var present = undefined;
    for (i = 0; i < array.length; i++) {
        if (array[i]._id == id) {
            present = array[i];
            break;
        }
    }
    return present;
}

//File: controllers/main_controller.js
var mongoose = require('mongoose');  
require('../models/model');
var Model  = mongoose.model('Model');

//GET - Return all participants in the DB
exports.findAll = function(req, res) {  
    Model.find({
        groupId: req.session.user.group
    }, function(err, model) {
    	if(err) res.send(500, err.message);
    	console.log('GET /participants');
        Model.findById(req.session.user.id, function(err, participant) {
            if(err) return res.status(500).send(err.message);
            console.log('GET /participants/' + req.session.user.id);
            if (participant.visible) {
                Model.findById(participant.visible, function(err, amigo) {
                    if(err) return res.status(500).send(err.message);
                    console.log('GET /chat');
                    res.render('participants/index', {model: model, amigo: amigo, date: participant.date, maxPrice: participant.maxPrice});
                });
            } else {
                res.render('participants/index', {model: model});
            }
        });
    });
};

//GET - Return a Participant with specified ID
exports.findById = function(req, res) {  
    var errors = req.session.errors || {};
    req.session.errors = {};
    Model.findById(req.params.modelId, function(err, participant) {
    	if(err) return res.status(500).send(err.message);
    	console.log('GET /participants/' + req.params.modelId);
        res.render('participants/show', {participant: participant, errors: errors});
    });
};

//PUT - Insert a new Present in a Participant
exports.addPresentToParticipant = function(req, res) {  
    var modelId = req.params.modelId;
    if (req.body.idea) {
        Model.findById(modelId, function(err, participant) {
            var count = participant.presents.length;
            console.log('ADD Present: ' + count);
            Model.update({_id: modelId},{$push: {presents:{idea: [req.body.idea], user: [req.session.user.username]}}}, {upsert:true}, function(err, result) {
               console.log(result);
               res.redirect('/participants/'+modelId);
            });
        });
    } else {
        req.session.errors = {"message": 'Rellena el campo'};
        res.redirect('/participants/'+modelId);
    }
}

//DELETE - Delete a Present of a Participant
exports.deletePresentOfParticipant = function(req, res) {  
    var modelId = req.params.modelId;
    var presentId = req.params.presentId;
    Model.findOne({_id: modelId, presents: {$elemMatch: {_id: presentId}}}).count(function(err, count)
    {
        if(count == 0) {
            res.redirect('/participants/'+modelId);
        } else {
            Model.update({_id: modelId},{$pull: {presents:{_id: [presentId]}}}, function(err, result) {
               res.redirect('/participants/'+modelId);
            });
        }
    });
}

//GET
exports.goSorteo = function(req, res) { 
    var errors = req.session.errors || {};
    console.log("Error: " + errors.message);
    req.session.errors = {};
    Model.find({
        groupId: req.session.user.group
    }, function(err, model) {
        if(err) res.send(500, err.message);
        console.log('GET /sorteo')
        res.render('participants/sorteo', {model: model, errors: errors});
    });
};

//PUT
exports.createSorteo = function(req, res) {  
    var date = req.body.date;
    var maxPrice = req.body.maxprice;
    Model.find({
        groupId: req.session.user.group
    }, function(err, model) {
        if(err) res.send(500, err.message);
        // for each participant in model
        console.log(model.length);
        var modelrandom;
        modelrandom = shuffle(model);
        for (i = 0; i < modelrandom.length; i++) {
            if (i>0 && i<modelrandom.length-1) {
                Model.update({_id: modelrandom[i].id},{$push: {date: date, maxPrice: maxPrice, visible: [modelrandom[i+1].id], invisible: [modelrandom[i-1].id]}}, {upsert:true}, function(err, result) {
                    console.log(result);
                });
            } else {
                if (i !== modelrandom.length-1) {
                    Model.update({_id: modelrandom[i].id},{$push: {date: date, maxPrice: maxPrice, visible: [modelrandom[i+1].id], invisible: [modelrandom[modelrandom.length-1].id]}}, {upsert:true}, function(err, result) {
                        console.log(result);
                    });
                } else {
                    Model.update({_id: modelrandom[i].id},{$push: {date: date, maxPrice: maxPrice, visible: [modelrandom[0].id], invisible: [modelrandom[i-1].id]}}, {upsert:true}, function(err, result) {
                        console.log(result);
                    });
                }
            }
        }
        console.log('PUT /sorteo')
        res.redirect('/participants');
    });
};

//GET
exports.goChat = function(req, res) {  
    var errors = req.session.errors || {};
    req.session.errors = {};
    Model.findById(req.session.user.id, function(err, participant) {
        if(err) return res.status(500).send(err.message);
        console.log('GET /chat');
        if (participant.visible) {
            Model.findById(participant.visible, function(err, amigo) {
                if(err) return res.status(500).send(err.message);
                console.log('GET /chat');
                res.render('chat/index', {participant: participant, amigo: amigo, errors: errors});
            });
        } else {
            res.render('chat/index', {participant: participant, errors: errors});
        }
    });
};

//PUT chat desde el usuario a su visible
exports.sendChatVisible = function(req, res) {  
    if (req.body.chat) {
        Model.findById(req.session.user.id, function(err, participant) {
            if(err) {
                req.session.errors = {"message": 'Se ha producido un error: '+err};
                console.log(req.session.errors.message);
                res.redirect('/chat');
                return;
            }
            Model.update({_id: participant.id},{$push: {visibleMessages:{text: [req.body.chat], origin: true}}}, {upsert:true}, function(err, result) {
                console.log(result);
            });
            Model.update({_id: participant.visible},{$push: {invisibleMessages:{text: [req.body.chat], origin: false}}}, {upsert:true}, function(err, result) {
                console.log(result);
            });
            res.redirect('/chat');
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
        Model.findById(req.session.user.id, function(err, participant) {
            if(err) {
                req.session.errors = {"message": 'Se ha producido un error: '+err};
                console.log(req.session.errors.message);
                res.redirect('/chat');
                return;
            }
            Model.update({_id: participant.id},{$push: {invisibleMessages:{text: [req.body.chat], origin: true}}}, {upsert:true}, function(err, result) {
                console.log(result);
            });
            Model.update({_id: participant.invisible},{$push: {visibleMessages:{text: [req.body.chat], origin: false}}}, {upsert:true}, function(err, result) {
                console.log(result);
            });
            res.redirect('/chat');
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
    Model.findById(req.session.user.id, function(err, user) {
        user.remove(function(err) {
            if(err) return res.status(500).send(err.message);
            delete req.session.user;
            res.redirect('/');
        })
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

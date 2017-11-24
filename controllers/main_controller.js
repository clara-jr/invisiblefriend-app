//File: controllers/main_controller.js
var mongoose = require('mongoose');  
require('../models/model');
var Model  = mongoose.model('Model');

//GET - Return all participants in the DB
exports.findAll = function(req, res) {  
    Model.find(function(err, model) {
    	if(err) res.send(500, err.message);
    	console.log('GET /participants')
        res.render('participants/index', {model: model});
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
               //res.render('participants/show', {participant: participant});
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
            //res.json("Filter does not exists in DB.");
            res.redirect('/participants/'+modelId);
        } else {
            Model.update({_id: modelId},{$pull: {presents:{_id: [presentId]}}}, function(err, result) {
               res.redirect('/participants/'+modelId);
            });
        }
    });
}

//GET
exports.goChat = function(req, res) {  
    var errors = req.session.errors || {};
    req.session.errors = {};
    Model.findById(req.session.user.id, function(err, participant) {
        if(err) return res.status(500).send(err.message);
        console.log('GET /chat');
        res.render('chat/index', {participant: participant, errors: errors});
    });
};

//PUT
exports.createChat = function(req, res) {  
    if (req.body.friend) {
        Model.findOne({
            name: req.body.friend
        }, function(err, existent) {
            if(err) {
                req.session.errors = {"message": 'Se ha producido un error: '+err};
                console.log(req.session.errors.message);
                res.redirect('/login');
                return;
            }
            if (existent) {
                Model.update({_id: existent.id},{$push: {invisible: [req.session.user.id]}}, {upsert:true}, function(err, result) {
                    console.log(result);
                });
                Model.update({_id: req.session.user.id},{$push: {visible: [existent.id]}}, {upsert:true}, function(err, result) {
                    console.log(result);
                });
            } else {
                req.session.errors = {"message": 'Usuario inexistente'};
                console.log(req.session.errors);
                console.log(req.session.errors.message);
            }
            res.redirect('/chat');
        });
    } else {
        req.session.errors = {"message": 'Rellena el campo'};
        console.log(req.session.errors);
        console.log(req.session.errors.message);
        res.redirect('/chat');
    }
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


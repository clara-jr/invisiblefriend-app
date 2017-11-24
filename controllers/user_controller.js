//File: controllers/main_controller.js
var mongoose = require('mongoose');  
require('../models/model');
var Model  = mongoose.model('Model');

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
    if (req.body.login && req.body.password) {
        var participant = new Model({
            name: req.body.login,
            password: req.body.password
        });
        Model.findOne({
            name: req.body.login
        }, function(err, existent) {
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
                res.redirect('/user');
                return;
            } else {
                participant.save(function(err, participant) {
                    if(err) {
                        req.session.errors = {"message": 'Se ha producido un error: '+err};
                        res.redirect("/user");        
                        return;
                    }
                    req.session.user = {id:participant.id, username:participant.name};
                    console.log(req.session.user);
                    console.log(req.session.user.id);
                    console.log(req.session.user.username);
                    res.redirect('/participants');
                });
            }
        });
    } else {
        req.session.errors = {"message": 'Rellena los campos'};
        console.log(req.session.errors);
        console.log(req.session.errors.message);
        res.redirect('/user');
    }
};



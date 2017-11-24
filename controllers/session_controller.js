//File: controllers/main_controller.js
var mongoose = require('mongoose');  
require('../models/model');
var Model  = mongoose.model('Model');

// MW de autorización de accesos HTTP restringidos
exports.loginRequired = function(req, res, next){
    if (req.session.user) {
        console.log("login ok");
        next();
    } else {
        console.log("login not ok");
        res.redirect('/login');
    }
};

// Get /login   -- Formulario de login
exports.loginForm = function(req, res) {
    var errors = req.session.errors || {};
    console.log("Error: " + errors.message);
    req.session.errors = {};
    res.render('sessions/new', {errors: errors});
};

// POST /login   -- Crear la sesion si usuario se autentica
exports.login = function(req, res) {
    console.log('POST');
    console.log(req.body);
    if (req.body.login && req.body.password) {
        Model.findOne({
            name: req.body.login
        }, function(err, participant) {
            if(err) {
                req.session.errors = {"message": 'Se ha producido un error: '+err};
                console.log(req.session.errors.message);
                res.redirect('/login');
                return;
            }
            if (participant) {
                if (participant.password === req.body.password) {
                    req.session.user = {id:participant.id, username:participant.name};
                } else {
                    req.session.errors = {"message": 'Contraseña incorrecta'};
                }
            } else {
                req.session.errors = {"message": 'Usuario inexistente'};
                console.log(req.session.errors);
                console.log(req.session.errors.message);
            }
            console.log(req.session.user);
            res.redirect('/participants');
        });
    } else {
        req.session.errors = {"message": 'Rellena los campos'};
        console.log(req.session.errors);
        console.log(req.session.errors.message);
        res.redirect('/login');
    }
};

// DELETE /logout   -- Destruir sesion 
exports.logout = function(req, res) {
    delete req.session.user;
    res.redirect('/');
};
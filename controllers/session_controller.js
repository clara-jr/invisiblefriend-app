//File: controllers/main_controller.js
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

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
    if (req.body.login && req.body.password && req.body.group) {
        MongoClient.connect(url, function(err, db) {
            if (err) return res.status(500).send(err.message); // Internal Server Error
            var dbo = db.db("invisiblefriend");
            var query = { name: req.body.login, groupId: req.body.group };
            dbo.collection("users").findOne(query, function(err, result) {
                if (err) { // Internal Server Error
                    req.session.errors = {"message": 'Se ha producido un error: '+err};
                    console.log(req.session.errors.message);
                    res.redirect("/login");        
                    return;
                }
                if (result) {
                    if (result.password === req.body.password) {
                        req.session.user = {id:result._id, username:result.name, group:result.groupId};
                    } else {
                        req.session.errors = {"message": 'Contraseña incorrecta'};
                    }
                } else {
                    req.session.errors = {"message": 'Usuario inexistente'};
                    console.log(req.session.errors);
                    console.log(req.session.errors.message);
                }
                console.log(req.session.user);
                db.close();
                res.redirect('/participants');
            });
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
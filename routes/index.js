var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {  
   res.render('index');
});

var mainController = require('../controllers/main_controller');
var sessionController = require('../controllers/session_controller');
var userController = require('../controllers/user_controller');

router.route('/participants')  
  	.get(sessionController.loginRequired, mainController.findAll);

router.route('/chat')  
  	.get(sessionController.loginRequired, mainController.goChat)
  	// devuelve el usuario de req.session y muestra sus conversaciones
  	// TODO si ya tiene amigo visible o invisible, se activan los chats y si no no
  	// si tiene amigo visible, se sustituye el input por un parrafo
    // TODO origin verde o gris
  	.put(sessionController.loginRequired, mainController.createChat);
  	// añade a visible del usuario req.session el amigo seleccionado y a invisible de ese usuario el req.session

router.route('/chat/actionVisible')
  	.put(sessionController.loginRequired, mainController.sendChatVisible);
  	// añade a visibleMessages del usuario req.session el mensaje y a invisibleMessages de ese usuario
  	// res.render('/chat');

router.route('/chat/actionInvisible')
  	.put(sessionController.loginRequired, mainController.sendChatInvisible);
  	// añade a invisibleMessages del usuario req.session el mensaje y a visibleMessages de ese usuario
  	// res.render('/chat');

router.route('/chat')  
  	.get(sessionController.loginRequired, mainController.goChat)
  	.put(sessionController.loginRequired, mainController.createChat);

router.route('/participants/:modelId')  
  	.get(sessionController.loginRequired, mainController.findById)
  	.put(sessionController.loginRequired, mainController.addPresentToParticipant);

router.route('/participants/:modelId/:presentId')  
  	.delete(sessionController.loginRequired, mainController.deletePresentOfParticipant);

router.route('/login')
	.get(sessionController.loginForm)     // formulario login
	.post(sessionController.login);  // crear sesión

router.get('/logout', sessionController.loginRequired, sessionController.logout); // destruir sesión

router.route('/user')
	.get(userController.signupForm)     // formulario sign un
	.post(userController.signup);     // registrar usuario

module.exports = router;
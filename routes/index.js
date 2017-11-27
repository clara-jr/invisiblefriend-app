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

router.route('/sorteo')  
    .get(sessionController.loginRequired, mainController.goSorteo)
    .put(sessionController.loginRequired, mainController.createSorteo);

router.route('/chat')  
  	.get(sessionController.loginRequired, mainController.goChat);

router.route('/chat/actionVisible')
  	.put(sessionController.loginRequired, mainController.sendChatVisible);

router.route('/chat/actionInvisible')
  	.put(sessionController.loginRequired, mainController.sendChatInvisible);

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

router.route('/delete')  
    .delete(sessionController.loginRequired, mainController.deleteUser)
    .put(sessionController.loginRequired, mainController.resetGroupGame);

module.exports = router;
var controller = require('../../lib/controller'),
	_ = require('underscore'),
	config = require('../../conf');

_.str = require('underscore.string');

var Users = require('../collections/users'),
	Events = require('../collections/events'),
	Talks = require('../collections/talks');

var eventsController = controller({
	path : 'eventos'
});

eventsController.beforeEach(function(req, res, next){
	req.data.analytics = config.analytics || '';

	next();
});

eventsController.get('/:slug', function (req, res) {
	var events = new Events();

	var q = events.fetchOne(function(item){
		return item.slug === req.params.slug;
	});

	q.then(function(event){
		if(!event){ return res.send(404, 'Event not found');}

		var data = {
			event : event.toJSON(),
			user : req.session.passport.user
		};

		if(req.query['talk-send'] ){
			data.talkSend = true;
		}

		res.render('events/call-for-proposals',data);
	});
});

eventsController.post('/:slug/call-for-proposals', function (req, res) {
	var events = new Events();
	var talks  = new Talks();

	var q = events.fetchOne(function(item){
		return item.slug === req.params.slug;
	});

	q.then(function(event){
		if(!event){ return res.send(404);}

		var talkData = {
			event : event.get('slug'),
			user : req.session.passport.user.username,
			framework : req.body.framework,
			sites : req.body.sites,
			experience : req.body.experience,
			approved : false
		};

		var talk = talks.add(talkData);

		var q = talk.save();

		q.then(function(){
			res.redirect('/eventos/'+ event.get('slug') + '?talk-send=success');
		}).fail(function(err){
			res.send(500, err);
		});
	});
});

module.exports = eventsController;

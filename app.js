var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

/* The port */
var port=process.env.PORT || 8000;
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
var hasLogged=false;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/* TEMPORARY HERE */
//app.use(express.static(path.join(__dirname, 'public')));

/*
	We create the http server where we run the sockets and
	the app at port 8000
*/

var http=require('http').Server(app);
var io=require('socket.io')(http);

/* Authentication and googleapis */
var {google}=require('googleapis');
var passport = require('passport');
var YoutubeV3Strategy = require('passport-youtube-v3').Strategy;
var mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
var OAuth2 = google.auth.OAuth2;
var session = require('express-session');

/* The module for the yt api */
var clientModule;

/* JSON with the configurations */
var config = {
    clientID: '416045802392-d449rqp17khmcuh2c889uija1f7juk8q.apps.googleusercontent.com',
    clientSecret: 'nWMWqeQlqfyPE1Torik69CK4',
    callbackURL: 'http://localhost:8000/auth/google/callback'
};

//---------------------------------------------- Database Setup in order to save the credentials ----------------------------------//
var db = mongoose.connect("mongodb://echatzief:fsfbeu1997@ds022408.mlab.com:22408/youtube_authentication",{ useNewUrlParser: true });

var userSchema = new mongoose.Schema({
    _id: { type: String },
    access_token: String,
    refresh_token: String,
    name: String
}, { collection: "user" });


var User = mongoose.model('User', userSchema);

//---------------------------------------------- Database Setup in order to save the credentials ----------------------------------//

//---------------------------------------------- Passport Configuration ----------------------------------------------------------//
passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new YoutubeV3Strategy({
        clientID: config.clientID,
        clientSecret: config.clientSecret,
        callbackURL: config.callbackURL,
        scope: ['https://www.googleapis.com/auth/youtube'],
        authorizationParams: {
            access_type : 'online'
        }
    },
    function(accessToken, refreshToken, profile, done) {

        process.nextTick(function() {


            User.findOne({ _id: profile.id }, function(err, res) {
                if (err)
                    return done(err);
                if (res) {
                  var dbVariable = mongoose.connect("mongodb://echatzief:fsfbeu1997@ds022408.mlab.com:22408/youtube_authentication",{ useNewUrlParser: true });
                    console.log("Update User");
                    User.remove().exec(); //Remove all documents
                    var user = new User({
                        _id: profile.id,
                        access_token: accessToken,
                        refresh_token: refreshToken,
                        name: profile.displayName
                    });
                    user.save(function(err) {
                        if (err)
                            return done(err);
                        return done(null, user);
                    });
                } else {
                    console.log("insert user");
                    var user = new User({
                        _id: profile.id,
                        access_token: accessToken,
                        refresh_token: refreshToken,
                        name: profile.displayName
                    });
                    user.save(function(err) {
                        if (err)
                            return done(err);
                        return done(null, user);
                    });
                }
            })
        });
    }
));

//---------------------------------------------- Passport Configuration ----------------------------------------------------------//

/* If you dont authenticate then go authenticate after the token has expire */
function userLogged(req, res, next) {
    if (hasLogged==false){
      hasLogged=true;
      setTimeout(resetAuthentication,600000); //Reset after 10 min
      res.redirect('/auth/google');
    }
    else{
      next();
    }
}

app.use(session({ secret: 'somesecret',resave: true,saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());


/* Main page we return the ReactJS frontend */
app.get('/',userLogged,function(req,res){
	res.sendFile( path.join( __dirname, 'build', 'index.html' ));
});

/* For the google authentication */
app.get('/auth/google', passport.authenticate('youtube'));

/* The callback function after authentication */
app.get('/auth/google/callback',
    passport.authenticate('youtube', {
        successRedirect: '/success',
        failureRedirect: '/failed'
    }));

/* If we succeded to authenticate properly  */
app.get('/success',function(req,res){


	/* Module for oauth client */
	var oauth2Client = new OAuth2(
        	config.clientID,
        	config.clientSecret,
        	config.callbackURL
    	);

	/* Pass the credentials to the module*/
    	oauth2Client.credentials = {
		access_token: req.user.access_token,
		refresh_token: req.user.refresh_token
    	};

	/* Save the module to global variable */
	clientModule=google.youtube({
		version: 'v3',
		auth: oauth2Client
    	})
	console.log(clientModule);
	res.redirect('/');
});

/* If the authentication fails */
app.get('/failed',function(req,res){
	res.send('Authentication failed');
});
/* We include after in order to authenticate first */
app.use( express.static( __dirname + '/build' ));


/*'params': {'mine': 'true',
                 'part': 'snippet,contentDetails,*/

/* We get the username of the channel */
app.post('/getChannelName',function(req,res){
	clientModule.channels.list({
    mine:'true',
    part:'snippet',
  },function(err,data){
    if(err){
      console.log(err);
    }
    else{
      /* We get the channel title */
      var username=data.data.items[0].snippet.title;
      var channelID=data.data.items[0].id;
      var data={
        'username':username,
        'id':channelID,
      }
      res.send(data);
    }
  });
});

/* Send video content with post request */
app.post('/getVideoContent',function(req,res){
  var videoInput=req.body.searchBox;
  console.log("Video: "+videoInput);
  clientModule.search.list({
    part:'snippet',
    type:'video',
    maxResults:'50',
    q:videoInput,
  },function(err,data){
    if(err){
      console.log(err);
    }
    else{
      var data={
        'items':data.data.items,
      }
      res.send(data);
    }
  });
});
/* Send channel content with post request */
app.post('/getChannelContent',function(req,res){
  var channelInput=req.body.searchBox;
  console.log("Channel: "+channelInput);
  clientModule.search.list({
    part:'snippet',
    type:'channel',
    maxResults:'50',
    q:channelInput,
  },function(err,data){
    if(err){
      console.log(err);
    }
    else{
      var data={
        'items':data.data.items,
      }
      res.send(data);
    }
  });
});
/* Search for playlists */
app.post('/getPlaylistContent',function(req,res){
  var playlist=req.body.searchBox;
  console.log("Playlist: "+playlist);
  clientModule.search.list({
    part:'snippet',
    type:'playlist',
    maxResults:'50',
    q:playlist,
  },function(err,data){
    if(err){
      console.log(err);
    }
    else{
      var data={
        'items':data.data.items,
      }
      res.send(data);
    }
  });
});
/* Get the items of the playlist */
app.post('/getPlaylistItems',function(req,res){
  var playlist=req.body.searchBox;
  console.log("Items: "+playlist);
  clientModule.playlistItems.list({
    part:'snippet',
    playlistId:playlist,
    maxResults:'50',
  },function(err,data){
    if(err){
      console.log(err);
    }
    else{
      //console.log(data);
      var data={
        'items':data.data.items,
      }
      res.send(data);
    }
  });
});

/*	We start the server at localhost:8000 */
http.listen(port,function(){
	console.log("Server is running at localhost: "+port);
});


function resetAuthentication(){
  hasLogged=false;
  console.log('Reset Timer');
}
module.exports = app;

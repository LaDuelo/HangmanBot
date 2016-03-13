var Discord = require("discord.js");
var mybot = new Discord.Client();
var botChannel;

var commands = {
    h: {
        name: "Hangman",
        process: function(mybot, botChannel, args){
            var hangman = require('./hangman.js');

            if(args['new']){
                hangman.generateGame(mybot, botChannel);
            }else if(args['reset']){
                hangman.resetGame(mybot, botChannel);
            }else if(args['help']){
                hangman.displayHelp(mybot, botChannel);
            }

            if(args.length !=0){
                for(key in args){
                    if(args[key].length == 1 && !Number.isInteger(args[key])){
                        hangman.checkLetter(mybot,botChannel,args[key]);
                    }
                }
            }
        }
    }
};

mybot.on("ready", function(){
    for(key in mybot.channels){
        if(mybot.channels[key].name == 'bot'){
            botChannel = mybot.channels[key];
        }
    }
});

function success(token){
    //console.log("Success: "+token);
}

function error(e){
    console.log("MeowBot Error: "+e);
}

mybot.on("message", function(message){
    var usr = message.author
    botChannel = message.author.typing.channel;
    //console.log(message.author.typing.channel);
    var msg = message.content.toLowerCase();
    var usrCmd = '';
    var end;
    var args={};
    //console.log(msg);
    if(usr.username == 'MeowBot'){
        return false;
    }

    if(msg.indexOf('!') == 0){
        if(msg.indexOf(' ') != -1){
            end = msg.indexOf(' ');
            usrCmd = msg.slice(1,end);
            args[msg.slice(end+1)] = msg.slice(end+1); // only using 1 argument right now anyway, so whatever
        }else{
            usrCmd = msg.slice(1);
        }
        //console.log('userCmd: '+usrCmd);
        if (commands[usrCmd]){
            commands[usrCmd].process(mybot, botChannel, args);
        }
    }

    //console.log(usrCommand);

});


mybot.login("laduelo420@gmail.com", "Frek123poloil");
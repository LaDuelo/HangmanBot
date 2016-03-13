/**
 * Created by wikis on 12-Mar-16.
 */
var fs = require('fs');
var csv = require('fast-csv');
var async = require('async');
var status = 0; //0 = idle, 1 = in progress
var errCount = 0; //counts errors made by the users

var hangImages = {
    '0':'http://i.imgur.com/f192wsN.png',
    '1':'http://i.imgur.com/nnog6Ql.png',
    '2':'http://i.imgur.com/2EkBagZ.png',
    '3':'http://i.imgur.com/FmkbToB.png',
    '4':'http://i.imgur.com/1OpZS6b.png',
    '5':'http://i.imgur.com/uyRhYjQ.png',
    '6':'http://i.imgur.com/yp69WYA.png'
}

var words = [];
var gameWord = '';
var gameWordSplit = {};
var wordGuessStr = '';


function success(token){
    console.log("Success: "+token);
}

function error(e){
    console.log("Hangman Error: "+e);
}
function resetGame(mybot, botChannel){
    if(status == 1) {
        status = 0;
        errCount = 0;
        gameWord = '';
        wordGuessStr = '';
        mybot.sendMessage(botChannel, "The game has been reset").then(success).catch(error);
    }else{
        mybot.sendMessage(botChannel, "No games currently running ").then(success).catch(error);
    }
}

module.exports = {
    resetGame: resetGame,
    generateGame: function(mybot, botChannel){
        if(status == 0){
            status = 1;
            errCount = 0;
            gameWord = '';
        }else{
            mybot.sendMessage(botChannel, "A game is already running").then(success).catch(error);
            return false;
        }
        var stream = fs.createReadStream("words.csv");


        if(words.length == 0){
            var csvStream = csv()
                .on("data", function(data){
                    words.push(data);
                })
                .on("end", function(){
                    console.log('Finished parsing words');
                    gameWord = pickAWord()
                    gameWordSplit = gameWord.split('');
                    hideWord(gameWord);
                });
            stream.pipe(csvStream);
        }else{
            gameWord = pickAWord();
            gameWordSplit = gameWord.split('');
            hideWord(gameWord);
        }

        function pickAWord(){
            var randNum = Math.floor(Math.random() * (words.length - 0 + 1)) + 0;
            gameWord = words[randNum][3];
            //mybot.sendMessage(botChannel, "Chosen word is: "+gameWord).then(success).catch(error);
            return gameWord;
        }

        function hideWord(gameWord){
            for(i=0;i<gameWord.length;i++){
                wordGuessStr += '\\_\\_ '
            }
            console.log(wordGuessStr);
            mybot.sendMessage(botChannel, "Guess: "+wordGuessStr).then(success).catch(error);
        }


    },
    checkLetter: function(mybot, botChannel, letter){
        if(status != 1){
            mybot.sendMessage("No game found. Type \!h new to start a new game").then(success).catch(error);
            return false;
        }
        var letterPos = [];

        function modifyHiddenWord(letterPos){
            var tempGuessStr = wordGuessStr.split(' ');
            for(i=0;i<letterPos.length;i++){
                tempGuessStr[letterPos[i]] = letter;
            }
            wordGuessStr = tempGuessStr.join(' ');
        }

        if(gameWordSplit.indexOf(letter) != -1 && gameWordSplit[letter] != 1 && errCount != 6){
            for(i=0;i<gameWordSplit.length;i++){
                console.log(gameWordSplit[i]);
                if(gameWordSplit[i] === letter){
                    gameWordSplit[letter] = 1;
                    letterPos.push(i);
                }
            }
            modifyHiddenWord(letterPos);
            mybot.sendMessage(botChannel, "Guess: "+wordGuessStr).then(success).catch(error);

        }else if(errCount < 5){
            errCount += 1;
            console.log(errCount);
            mybot.sendMessage(botChannel,hangImages[errCount]+" You just fucked up. Errors: "+errCount.toString()+"/6").then(success).catch(error);
        }else{
            errCount += 1;
            mybot.sendMessage(botChannel,hangImages[errCount]+" You are fucked. Errors: "+errCount.toString()+"/6. Resetting.").then(resetGame(mybot, botChannel)).catch(error);
        }

        mybot.sendMessage(botChannel, letter).then(success).catch(error);
    },
    displayHelp: function(mybot, botChannel){
        mybot.sendMessage(botChannel,"\'!h new\' to start a new game. \n\'!h reset\' to reset the game.\n\'!h \<letter\>' to give your letter as answer").then(success).catch(error);
    }
}
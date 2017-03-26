const restify = require('restify')
const builder = require('botbuilder')
const config = require('./config.js')
var HashMap = require('hashmap');
//
//    Bot stuff
//

// Connection to Microsoft Bot Framework
const connector = new builder.ChatConnector({
  appId: config.appId,
  appPassword: config.appPassword,
});

const bot = new builder.UniversalBot(connector);

var bpDataMap = new HashMap();

// Event when Message received
bot.dialog('/', (session) => {
  session.send("Hello, I am Gautams Brain. I keep track of beer pong wins.");
  session.replaceDialog('/profile');
})

bot.dialog('/profile', (session) => {
  var card = createChoiceCard(session);
  var msg = new builder.Message(session).addAttachment(card);
  session.send(msg);
});

bot.beginDialogAction('currenttotal', '/currenttotal');
bot.dialog('/currenttotal', (session) => {
  //Logic to display all wins
  bpDataMap.forEach(function(value, key) {
      session.send(key + " have " + value + " wins.");
  });
  session.endDialog();
  session.replaceDialog('/');
});

bot.beginDialogAction('addtototal', '/addtototal');
bot.dialog('/addtototal', [
    function (session) {
        builder.Prompts.text(session, '"Input [Person1] [Person2]"');
    },
    function (session, results) {
        var combinedNames = results.response.toLowerCase();
        console.log(combinedNames);
        if(bpDataMap.has(combinedNames)) {
          bpDataMap.set(combinedNames, bpDataMap.get(combinedNames) + 1);
        }
        else {
          bpDataMap.set(combinedNames, 1);
        }
        session.endDialog();
        session.replaceDialog('/');
    }
]);


bot.beginDialogAction('removewin', '/removewin');
bot.dialog('/removewin',  [
  function (session) {
      builder.Prompts.text(session, '"Input [Person1] [Person2]"');
  },
  function (session, results) {
      var combinedNames = results.response.toLowerCase();
      if(bpDataMap.has(combinedNames)) {
        bpDataMap.set(combinedNames, bpDataMap.get(combinedNames) - 1);
        if(bpDataMap.get(combinedNames) == 0) {
          bpDataMap.remove(combinedNames);
        }
        session.endDialog();
        session.replaceDialog('/');
      }
  }

]);


function createChoiceCard(session){
	return new builder.HeroCard(session)
        .buttons([
            builder.CardAction.dialogAction(session, 'currenttotal', '', 'Current standings'),
            builder.CardAction.dialogAction(session, 'addtototal', '', 'Update standings'),
            builder.CardAction.dialogAction(session, 'removewin', '', 'Remove a win')
        ])
        // .title("Welcome")
        // .images([
        //     builder.CardImage.create(session, 'https://media.giphy.com/media/3JUPbDh2g7uGk/giphy.gif')
        // ]);
}


function createImageCard(session, title, url){
  return new builder.HeroCard(session)
        .title(title)
        .images([
            builder.CardImage.create(session, url)
        ]);
}


// Server Init for bot
const server = restify.createServer()
server.listen(process.env.PORT || 8080)
server.post('/', connector.listen())

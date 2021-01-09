// Import dependencies
const Discord = require('discord.js');
const Picovoice = require("@picovoice/picovoice-node");

// Define clients
const discordClient = new Discord.Client();

async function runCommand (member, keyword) {
	switch(keyword) {
	    case 'abrakadabra':
	      console.log('Muting ' + member[0]);
	      member[1].voice.setMute(true);
	      break;
	    case 'alakazam':
	      console.log('Unmuting ' + member[0]);
	      member[1].voice.setMute(false);
	      break;
	    case 'hocus pocus':
	      console.log('Disconnecting ' + member[0]);    
          member[1].voice.kick('');
          break;
        default:
	      console.log("Keyword not defined!");
	}
}

async function startListener(message) {

    const picovoiceClient = new Picovoice(
        keywordArgument,
        keywordCallback,
        contextPath,
        inferenceCallback
    );
    
    const inferenceCallback = function (inference) {
        console.log("Inference:");
        console.log(JSON.stringify(inference, null, 4));
    };

    const connection = await message.member.voice.channel.join();
    const dispatcher = connection.play('./keywords/silence.wav');
            
    dispatcher.on('finish', () => {
        console.log('dispatcher has finished playing!');
    });

    const userId = message.member.id;
    const audio = connection.receiver.createStream(userId, {
        mode: "pcm",
        end: "manual",
    });

    picovoiceClient.process(audio);

    const keywordCallback = function (keyword) {
    	const excemptUsers = ['768387256226283520', '198392443190771722', '299963524824694785'];
        console.log(`Detected "${keyword}".`)
        var channel = message.member.voice.channel;
        for (let member of channel.members) {
            if (!excemptUsers.includes(member[0])) {
            	runCommand(member, keyword);
            }
        }
    }
}

// Login to discord
discordClient.login(process.env.DISCORD_TOKEN);

// Define listeners
discordClient.once('ready', () => {
	console.log('Discord Client Loaded!');
});

discordClient.on('message', async (message) => {
    if (message.content.substr(0,5) === '!join') {
        startListener(message)
    }
})

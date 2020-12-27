// Import dependencies
const Discord = require('discord.js');
const WakewordDetector = require('@mathquis/node-personal-wakeword')

// Define clients
const discordClient = new Discord.Client();
const keywordClient = new WakewordDetector({
    sampleRate: 48000,
    threshold: 0.5
})

async function startListener(message) {

    keywordClient.on('ready', () => {
        console.log('listening...')
    })

    keywordClient.on('error', err => {
        console.error(err.stack)
    })

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

    audio.pipe(keywordClient)

    keywordClient.on('keyword', ({keyword, score, threshold, timestamp, audioData}) => {
    	const excemptUsers = ['768387256226283520', '198392443190771722', '299963524824694785'];
        console.log(`Detected "${keyword}" with score ${score} / ${threshold}`)
        var channel = message.member.voice.channel;
        for (let member of channel.members) {
            if (!excemptUsers.includes(member[0])) {
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
        }
    })

    // Define keywords
    await keywordClient.addKeyword('abrakadabra', [
        './keywords/abrakadabra1.wav',
        './keywords/abrakadabra2.wav'
    ], {
        disableAveraging: true,
        threshold: 0.52
    })

    await keywordClient.addKeyword('alakazam', [
        './keywords/alakazam1.wav',
        './keywords/alakazam2.wav'
    ], {
        disableAveraging: true,
        threshold: 0.56
    })

    await keywordClient.addKeyword('hocus pocus', [
        './keywords/hocuspocus1.wav',
        './keywords/hocuspocus2.wav'
    ], {
        disableAveraging: true,
        threshold: 0.55
    })
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

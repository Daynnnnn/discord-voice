// Import dependencies
const Discord = require('discord.js');
const WakewordDetector = require('@mathquis/node-personal-wakeword')

// Define clients
const discordClient = new Discord.Client();
const keywordClient = new WakewordDetector({
    sampleRate: 48000,
    threshold: 0.5
})

async function main() {
    // Define listeners
    discordClient.once('ready', () => {
    	console.log('Ready!');
    });

    keywordClient.on('ready', () => {
        console.log('listening...')
    })

    keywordClient.on('error', err => {
        console.error(err.stack)
    })

    discordClient.on('message', async (message) => {
        if (message.content.substr(0,5) === '!join') {
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
                console.log(`Detected "${keyword}" with score ${score} / ${threshold}`)
                var channel = message.member.voice.channel;
                for (let member of channel.members) {
                    if (member[0] == message.content.substr(6)) {
                        console.log(keyword)
                        if (keyword == 'abrakadabra') { member[1].voice.setMute(true) }
                        if (keyword == 'alakazam') { member[1].voice.setMute(false) }
                        console.log('Muting!')
                   }
                }
            })

        }
    })

    // Login to discord
    discordClient.login(process.env.DISCORD_TOKEN);

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
        threshold: 0.52
    })

    await keywordClient.addKeyword('hocus pocus', [
        './keywords/hocuspocus1.wav',
        './keywords/hocuspocus2.wav'
    ], {
        disableAveraging: true,
        threshold: 0.52
    })
}

main()
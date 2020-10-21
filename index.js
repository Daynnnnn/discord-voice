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
        if (message.content === '!join') {
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
                    if (member[0] == '198392443190771722') {
                        console.log(keyword)
                        if (keyword == 'abrakadabra') { var mute = true }
                        if (keyword == 'alakazam') { var mute = false }
                        console.log('Muting!')
                        member[1].voice.setMute(mute)
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
        threshold: 0.48
    })

    await keywordClient.addKeyword('alakazam', [
        './keywords/alakazam1.wav',
        './keywords/alakazam2.wav'
    ], {
        disableAveraging: true,
        threshold: 0.48
    })
}

main()
const Discord = require('discord.js');
const AWS = require("aws-sdk");
const client = new Discord.Client();
const fs = require('fs');
const WakewordDetector = require('@mathquis/node-personal-wakeword')
const transcribeservice = new AWS.TranscribeService();

AWS.config.update({region: "eu-west-1"});

async function main() {
    client.once('ready', () => {
    	console.log('Ready!');
    });
    
    client.login('NzY4Mzg3MjU2MjI2MjgzNTIw.X4_uZQ.0u7I0yOoIoLKaz-0blYwZMk2f4k');
    
    const detector = new WakewordDetector({
        sampleRate: 48000,
        threshold: 0.5
    })

    await detector.addKeyword('abrakadabra', [
        './keywords/abrakadabra1.wav',
        './keywords/abrakadabra2.wav'

    ], {
        // Options
        disableAveraging: true, // Disabled by default, disable templates averaging (note that resources consumption will increase)
        threshold: 0.52 // Per keyword threshold
    })
    
                    // The detector will emit a "ready" event when its internal audio frame buffer is filled
    detector.on('ready', () => {
        console.log('listening...')
    })

    // The detector will emit an "error" event when it encounters an error (VAD, feature extraction, etc.)
    detector.on('error', err => {
        console.error(err.stack)
    })

    client.on('message', async (message) => {
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

            audio.pipe(detector)

            detector.on('keyword', ({keyword, score, threshold, timestamp, audioData}) => {
                console.log(`Detected "${keyword}" with score ${score} / ${threshold}`)
                var channel = message.member.voice.channel;
                for (let member of channel.members) {
                    if (member[0] == '302161481842294785') {
                        console.log('Muting!')
                        member[1].voice.setMute(true)
                   }
                }
            })

        }
    })
}

main()
const readline = require('readline')
const ytdl = require('ytdl-core')
const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

rl.question('Please provide the Youtube link you wish to download: ', (link) => {
    let url = ytdl.validateURL(link)

    if(url)
    {
        ytdl.getBasicInfo(link).then((info) => {

            fs.mkdir(`${info.videoDetails.videoId}`, (err) => {
                if(err) throw err
                console.log(`Created directory for ${info.videoDetails.videoId}`)
            })

            let video = ytdl(link, {quality: "highestvideo"}).pipe(fs.createWriteStream(`./${info.videoDetails.videoId}/video.mp4`))
            ytdl(link, {quality: "highestaudio"}).pipe(fs.createWriteStream(`./${info.videoDetails.videoId}/audio.mp4`))

            video.on('ready', () => {
                console.log('Downloading...')
            })
            
            video.on('finish', () => {
                console.log('Downloaded video and audio, now encoding into one single file...')
                ffmpeg({source: `./${info.videoDetails.videoId}/video.mp4`}).addInput(`./${info.videoDetails.videoId}/audio.mp4`).saveToFile(`./${info.videoDetails.videoId}/${info.videoDetails.title}.mp4`).on('end', () => {
                    fs.unlink(`./${info.videoDetails.videoId}/video.mp4`, (err) => {
                        if(err) throw err
                    })
                    fs.unlink(`./${info.videoDetails.videoId}/audio.mp4`, (err) => {
                        if(err) throw err
                    })

                    rl.close()
                })
            })
        })

    } else {
        console.log("The url provided is not valid")
        rl.close()
    }
})
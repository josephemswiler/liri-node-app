require('dotenv').config()
let keys = require('./keys.js')
let bluebird = require('bluebird')
let request = require('request-promise')
let fs = require('fs-extra')
let Twitter = require('twitter')
let client = new Twitter(keys.twitter)
let arg = process.argv.slice(3)

let logResult = (result) => {
    fs.appendFile('log.txt',
    `
    ${result}
    ==========================================================
    `) //writes to end of file
        .catch(err => console.log(err))
}

let getTweets = () => {
    client.get('statuses/user_timeline', function (error, tweets, response) {
        if (error) throw error

        let data = []

        for (let i = 0; i < tweets.length; i++) {
            if (i < 20) {
                let date = tweets[i].created_at.split(' ')
                date.splice(0, 1)
                date.splice(2, 1)
                date.splice(2, 1)
                data.push([
                    `Date: ${date[0]} ${date[1]}, ${date[2]}`,
                    `Tweet: ${tweets[i].text}`
                ])
            }
        }
        let print = JSON.stringify(data, null, 2)

        console.log('\x1b[31m%s\x1b[0m', print)
        logResult(print)
    })
}

let getMovie = (passedItem) => {
    let movie = 'Mr.+Nobody'

    if (passedItem.length > 0) {
        movie = passedItem.join('+')
    }
    let queryUrl = "http://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=trilogy";

    request(queryUrl)
        .then(response => {
            let data = JSON.parse(response)
            let imdb = ''
            let rt = ''
            data.Ratings.forEach(item => {
                switch (item.Source) {
                    case 'Internet Movie Database':
                        imdb = item.Value
                        break
                    case 'Rotten Tomatoes':
                        rt = item.Value
                        break
                }
            })
            let print = JSON.stringify(
                [
                    `Title: ${data.Title}`,
                    `Year: ${data.Year}`,
                    `IMDB Rating: ${imdb}`,
                    `Rotten Tomatoes Rating: ${rt}`,
                    `Country: ${data.Country}`,
                    `Language: ${data.Language}`,
                    `Plot: ${data.Plot}`,
                    `Actors: ${data.Actors}`
                ],
                null, 2)

            console.log('\x1b[31m%s\x1b[0m', print)
            logResult(print)
        })
        .catch(err => console.log(err))
}

let runLiri = (command, item) => {
    switch (command) {
        case 'movie-this':
            getMovie(item)
            break
        case 'my-tweets':
            getTweets()
            break
        case 'do-what-it-says':
            doIt()
            break
    }
}

let doIt = () => {
    fs.readFile('random.txt', 'utf8')
    .then(data => {
        data = data.split(',')
        let command = data[0]
        let item = data[1].split()
        runLiri(command, item)
    })
    .catch(err => console.log(err))
}

runLiri(process.argv[2], arg)
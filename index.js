const chat = require('facebook-chat-api')
const mysql = require('mysql')
const async = require('async')
const log = require('winston')

log.info('FacebookMessageGrabber is booting up...')

require('dotenv').config()

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    charset: 'utf8mb4'
})

db.connect()

let timestamp = undefined

chat({
    email: process.env.FB_USERNAME,
    password: process.env.FB_PASSWORD
}, (err, api) => {
    if (err) return log.error(err)

    getMessages(api)
})

function getMessages (api) {
    log.info('Getting messages...')

    api.getThreadHistory(process.env.CHAT_ID, 50, timestamp, (err, history) => {
        if (err) return log.error(err)

        if (timestamp != undefined) history.pop()

        if (history.length > 0) {

            timestamp = history[0].timestamp

            async.every(history, (message, callback) => {
                const isMedia = message.attachments.length

                log.info('[' + message.senderName + '] ' + (isMedia ? message.attachments[0].largePreviewUrl : message.body))

                db.query('INSERT INTO messages SET ?', {
                    type: isMedia ? 'media' : 'message',
                    body: isMedia ? null : message.body,
                    sender_id: message.senderID,
                    sender_name: message.senderName,
                    image_url: isMedia ? message.attachments[0].largePreviewUrl : null,
                    image_preview: isMedia ? message.attachments[0].thumbnailUrl : null,
                    timestamp: message.timestamp
                }, err => {
                    callback(null, !err)
                })
            }, err => {
                if (err) log.error(err)

                getMessages(api)
            })
        } else {
            log.info('We don\'t have more messages!')
            db.end()
        }
    })
}

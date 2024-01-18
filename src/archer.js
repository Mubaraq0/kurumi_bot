require('dotenv').config()
const {
    default: Baileys,
    DisconnectReason,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeInMemoryStore,
    delay
} = require('@WhiskeySockets/baileys')
const { QuickDB } = require('quick.db')
const { MongoDriver } = require('quickmongo')
const { Collection } = require('discord.js')
const auth = require("./Handlers/auth")
const MessageHandler = require('./Handlers/Message')
const CardHandler = require('./Handlers/card')
   // call the summon function
const jid = "27640108995-120363122579144951@g.us";

const EventsHandler = require('./Handlers/Events')
const contact = require('./lib/contacts')
const gpt = require('./lib/gpt')
const utils = require('./lib/function')
const YT = require('./lib/YT')
const AI_lib = require('./lib/AI_lib')
const express = require("express");
const app = express();
const qr = require('qr-image')
const mongoose = require('mongoose')
const P = require('pino')
const axios = require('axios')
const { Boom } = require('@hapi/boom')
const { join } = require('path')
const { readdirSync, writeFileSync, unlink } = require('fs-extra')
const port = process.env.PORT || 3000
const driver = new MongoDriver(process.env.URL)
const chalk = require('chalk')

const start = async () => {
    // if (process.env.SESSION) {
    //     const { data } = await axios.get(process.env.SESSION)
    //     writeFileSync('./session', JSON.stringify(data))
    // }
    // const { state, saveCreds } = await useMultiFileAuthState('./session')
    
    // const clearState = () => unlink('./session')

    // const client = Baileys({
    //     version: (await fetchLatestBaileysVersion()).version,
    //     auth: state,
    //     logger: P({ level: 'silent' }),
    //     printQRInTerminal: true
    // })

      await mongoose.connect(process.env.SESSION_URL);

  const { useAuthFromDatabase } = new auth(process.env.SESSION);

  const { saveState, state, clearState } = await useAuthFromDatabase();

  const client = Baileys({
        version: (await fetchLatestBaileysVersion()).version,
        auth: state,
        logger: P({ level: 'silent' }),
        printQRInTerminal: true
    })

    //Config
    client.name = process.env.NAME || 'Archer'
    client.prefix = process.env.PREFIX || '.'
    client.proUser = (process.env.proUser  || '263788671478').split(',')
    client.writesonicAPI = process.env.WRITE_SONIC || null
    client.bgAPI = process.env.BG_API_KEY || null
    client.mods = (process.env.MODS || '263788671478').split(',')

    //Database
    client.DB = new QuickDB({
        driver
    })
    //Tables
    client.contactDB = client.DB.table('contacts')

    //Contacts
    client.contact = contact

    //Open AI
    client.AI = AI_lib

    //Experience
    client.exp = client.DB.table('experience')

    //Cards
    client.cards = client.DB.table('cards')

    //Cradits
    client.cradit = client.DB.table('cradit')

    //RPG
    client.rpg = client.DB.table('rpg_game')
    
    //potion
    client.chara = client.DB.table('chara')
    
    //charm
    client.charm = client.DB.table('charm')
    
    //Commands
    client.cmd = new Collection()

    //Utils
    client.utils = utils

    //GPT
    client.gpt = gpt

    //YT gif
    client.YT = YT;

    //Colourful
    client.log = (text, color = 'green') =>
        color ? console.log(chalk.keyword(color)(text)) : console.log(chalk.green(text))

    //Command Loader
    const loadCommands = async () => {
        const readCommand = (rootDir) => {
            readdirSync(rootDir).forEach(($dir) => {
                const commandFiles = readdirSync(join(rootDir, $dir)).filter((file) => file.endsWith('.js'))
                for (let file of commandFiles) {
                    const command = require(join(rootDir, $dir, file))
                    client.cmd.set(command.name, command)
                }
            })
            client.log('Commands loaded!')
        }
        readCommand(join(__dirname, '.', 'Commands'))
    }
    
      
    //connection updates
    client.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update
        if (update.qr) {
            client.log(`[${chalk.red('!')}]`, 'white')
            client.log(`Scan the QR code above | You can also authenicate in http://localhost:${port}`, 'blue')
            client.QR = qr.imageSync(update.qr)
        }
        if (connection === 'close') {
            const { statusCode } = new Boom(lastDisconnect?.error).output
            if (statusCode !== DisconnectReason.loggedOut) {
                client.log('Connecting...')
                setTimeout(() => start(), 3000)
            } else {
                clearState()
                client.log('Starting...')
                setTimeout(() => start(), 3000)
            }
        }
        if (connection === 'connecting') {
            client.state = 'connecting'
            client.log('Connecting to WhatsApp...')
        }
        if (connection === 'open') {
            client.state = 'open'
            loadCommands()
            client.log('🤖 you have did it once again Deryl')
        }
    })

    CardHandler(client)

    app.get('/', (req, res) => {
        res.status(300).setHeader('Content-Type', 'image/png').send(client.QR)
    })

    client.ev.on('messages.upsert', async (messages) => await MessageHandler(messages, client))

    client.ev.on('group-participants.update', async (event) => await EventsHandler(event, client))

    client.ev.on('contacts.update', async (update) => await contact.saveContacts(update, client))

    client.ev.on('creds.update', saveState)
    return client
}

if (!process.env.URL) return console.error('You have not provided any MongoDB URL!!')
driver
    .connect()
    .then(() => {
        console.log(`Connected to the database!`)
        // Starts the script if gets a success in connecting with Database
        start()
    })
    .catch((err) => console.error(err))

app.listen(port, () => console.log(`Server started on PORT : ${port}`))
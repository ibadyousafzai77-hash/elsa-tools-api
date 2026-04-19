const express = require('express');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const fbdown = require('fb-downloader-scrapper');
const ytdl = require('@distube/ytdl-core');

const app = express();
const port = 7860;

// WhatsApp Client Setup
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// QR Code Terminal mein dikhane ke liye aur Web page par bhi
let qrGenerated = "";
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    qrGenerated = qr; 
    console.log('QR RECEIVED, Scan it!');
});

client.on('ready', () => {
    console.log('Elsa is Online for Testing!');
});

// Simple commands for testing
client.on('message', async msg => {
    if (msg.body === '!test') {
        msg.reply('Elsa Tools API is working fine! ✅');
    }
});

client.initialize();

// API Endpoints (Jo pehle banaye thay)
app.get('/', (req, res) => {
    if (qrGenerated && !client.info) {
        res.send(`<h1>Scan QR Code</h1><img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrGenerated)}&size=300x300" />`);
    } else if (client.info) {
        res.send('<h1>Elsa is Logged In! ✅</h1>');
    } else {
        res.send('<h1>Starting Elsa... Please wait.</h1>');
    }
});

// FB/YT Endpoints (Wahi purane)
app.get('/api/fb', async (req, res) => { /* FB Code */ });
app.get('/api/yt', async (req, res) => { /* YT Code */ });

app.listen(port, () => console.log(`Server running on port ${port}`));

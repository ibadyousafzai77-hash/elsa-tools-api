const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const fbdown = require('fb-downloader-scrapper');
const ytdl = require('@distube/ytdl-core');
const { removeBackground } = require('@imgly/background-removal-node');

const app = express();
const port = 7860;

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        handleSIGINT: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

let qrCodeData = "";
client.on('qr', (qr) => {
    qrCodeData = qr;
    qrcode.generate(qr, { small: true });
    console.log('QR Received! Scan via Web Page or Terminal.');
});

client.on('ready', () => console.log('Elsa is Online! Unlimited RemBG Active ✅'));

client.on('message', async msg => {
    const chat = await msg.getChat();
    const text = msg.body.toLowerCase();

    // 1. YouTube Downloader (!yt [link])
    if (text.startsWith('!yt')) {
        const url = msg.body.split(' ')[1];
        if (!url) return msg.reply('Bhai, link toh do!');
        try {
            msg.reply('Wait... YT video fetch ho rahi hai ⏳');
            const info = await ytdl.getInfo(url);
            const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo', filter: 'audioandvideo' });
            const media = await MessageMedia.fromUrl(format.url);
            await client.sendMessage(msg.from, media, { caption: info.videoDetails.title });
        } catch (e) { msg.reply('YT Download Error! ❌'); }
    }

    // 2. Facebook Downloader (!fb [link])
    if (text.startsWith('!fb')) {
        const url = msg.body.split(' ')[1];
        if (!url) return msg.reply('Bhai, link toh do!');
        try {
            msg.reply('Wait... FB video fetch ho rahi hai ⏳');
            const data = await fbdown(url);
            const videoUrl = data.Normal_Video || data.HD;
            const media = await MessageMedia.fromUrl(videoUrl);
            await client.sendMessage(msg.from, media);
        } catch (e) { msg.reply('FB Download Error! ❌'); }
    }

    // 3. Unlimited Background Remover (!rembg - reply to image)
    if (text === '!rembg') {
        let targetMsg = msg.hasQuotedMsg ? await msg.getQuotedMessage() : msg;
        if (!targetMsg.hasMedia) return msg.reply('Bhai, photo bhej kar !rembg likho ya photo ko reply karo.');

        try {
            msg.reply('Unlimited AI model se background saaf ho raha hai... ⏳ (Pehli baar mein 1 min lag sakta hai)');
            const media = await targetMsg.downloadMedia();
            const imageBuffer = Buffer.from(media.data, 'base64');
            
            // AI model processing (No API Key needed)
            const blob = await removeBackground(imageBuffer);
            const buffer = Buffer.from(await blob.arrayBuffer());
            
            const outputMedia = new MessageMedia('image/png', buffer.toString('base64'));
            await client.sendMessage(msg.from, outputMedia, { caption: 'Background Removed! ✅ (Unlimited Mode)' });
        } catch (e) { 
            console.error(e);
            msg.reply('RemBG Error! Shayad image heavy hai ya model load nahi hua.');
        }
    }
    
    // Test Command
    if (text === '!test') msg.reply('Elsa Tools are Working! 🚀');
});

client.initialize();

app.get('/', (req, res) => {
    if (qrCodeData && !client.info) {
        res.send(`<h2>Scan Elsa QR Code</h2><img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrCodeData)}&size=300x300" />`);
    } else {
        res.send(client.info ? '<h1>Elsa Logged In! ✅</h1>' : '<h1>Loading Elsa Engine...</h1>');
    }
});

app.listen(port, () => console.log('Server is running on port ' + port));

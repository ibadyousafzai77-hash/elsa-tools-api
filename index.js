const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fbdown = require('fb-downloader-scrapper');
const ytdl = require('@distube/ytdl-core');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 7860;

// --- 20 KEYS POOL FOR REMOVE.BG (Paste your keys here) ---
const REMOVE_BG_KEYS = [
    "key1_yahan_dalen", 
    "key2_yahan_dalen",
    "key3_yahan_dalen"
    // Isi tarah baki saari 20 keys add kar dein
];
let currentKeyIndex = 0;

app.get('/', (req, res) => {
    res.send('Elsa Tools API (YT, FB, RemBG) is Running ✅');
});

// --- Facebook Downloader ---
app.get('/api/fb', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL missing" });
    try {
        const data = await fbdown(url);
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: "FB Download failed" });
    }
});

// --- YouTube Downloader ---
app.get('/api/yt', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL missing" });
    try {
        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { quality: 'highestvideo', filter: 'audioandvideo' });
        res.json({ 
            title: info.videoDetails.title, 
            thumbnail: info.videoDetails.thumbnails[0].url,
            downloadUrl: format.url 
        });
    } catch (e) {
        res.status(500).json({ error: "YT Download failed" });
    }
});

// --- Background Remover (With 20-Key Auto-Switch) ---
app.get('/api/rembg', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "Image URL missing" });

    const tryRemoveBg = async (index) => {
        if (index >= REMOVE_BG_KEYS.length) {
            throw new Error("All 20 keys have reached their limit!");
        }

        try {
            const response = await axios.get(`https://api.remove.bg/v1.0/removebg?image_url=${encodeURIComponent(url)}&size=auto`, {
                headers: { 'X-Api-Key': REMOVE_BG_KEYS[index] },
                responseType: 'arraybuffer'
            });
            return response.data;
        } catch (error) {
            // Agar limit khatam ho (402/429), agli key par jao
            if (error.response && (error.response.status === 402 || error.response.status === 429)) {
                console.log(`Key ${index + 1} exhausted. Switching to Key ${index + 2}...`);
                currentKeyIndex++;
                return tryRemoveBg(currentKeyIndex);
            }
            throw error;
        }
    };

    try {
        const result = await tryRemoveBg(currentKeyIndex);
        res.set('Content-Type', 'image/png');
        res.send(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(PORT, () => console.log(`Elsa Tools API running on port ${PORT}`));

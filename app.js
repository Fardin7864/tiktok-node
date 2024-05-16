const express = require('express');
const axios = require('axios');
const multer = require('multer');
const { getAuthUrl, getAccessToken } = require('./auth');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

// Middleware to serve static files
app.use(express.static('public'));

app.get('/auth', (req, res) => {
    res.redirect(getAuthUrl());
});

app.get('/auth/callback', async (req, res) => {
    const { code } = req.query;
    try {
        const accessToken = await getAccessToken(code);
        req.session.accessToken = accessToken;
        res.redirect('/');
    } catch (error) {
        res.status(500).send('Authentication failed');
    }
});

app.post('/post', upload.single('video'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const accessToken = req.session.accessToken;
    if (!accessToken) {
        return res.status(401).send('User not authenticated');
    }

    try {
        const videoPath = req.file.path;
        const formData = new FormData();
        formData.append('video', fs.createReadStream(videoPath));

        const response = await axios.post('https://open-api.tiktok.com/video/upload/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        res.send('Video posted successfully');
    } catch (error) {
        res.status(500).send('Error posting video');
    }
});

app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});

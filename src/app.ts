import express from 'express';
import cors from "cors";
// import axios from "axios";
// import cheerio from "cheerio";
import puppeteer from 'puppeteer';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

const whitelist = ['http://192.168.29.22:3000'];
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};

app.use(cors(corsOptions));

app.get('/', (req, res) => {
    res.send('Hello World');
});

const getVideoLink = async (url: string) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate to a webpage
    await page.goto(url);

    // Wait for the video element to be available in the DOM
    await page.waitForSelector('video');

    // Extract the src attribute value of the video element
    const videoSrc = await page.evaluate(() => {
        const videoElement = document.querySelector('video');
        return videoElement ? videoElement.getAttribute('src') : null;
    });

    // Close the browser
    await browser.close();

    return videoSrc;
};

app.get("/api/download", (request, response) => {
    response.json({ yes: "it works" });
});

app.post("/api/download", async (request, response) => {
    // console.log("request coming in...");
    try {
        const videoLink = await getVideoLink(request.body.url);
        if (videoLink !== undefined) {
            response.json({ downloadLink: videoLink });
            // console.log(`videoLink: ${videoLink}, url: ${request.body.url}`);
        } else {
            response.json({ error: "The link you have entered is invalid. " });
            // console.log(`videoLink: ${videoLink}, url: ${request.body.url}`);
        }
    } catch (err) {
        // console.log('err', err);
        response.json({
            error: "There is a problem with the link you have provided."
        });
    }
});

app.listen(PORT, () => {
    return console.log(`Express is listening at port: ${PORT}`);
});
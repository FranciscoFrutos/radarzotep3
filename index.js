import Express from 'express'

import cors from 'cors'
import fs from 'fs';
const PORT = process.env.PORT || 3000
const app = Express()

const gameHtmlClass = "ImpressionTrackedElement" 
const baseUrl = "https://store.steampowered.com/search/?maxprice=5&supportedlang=english&specials=1&ndl=1"



app.use(Express.json())

app.use(cors({
    origin: ['http://localhost:5173', "https://radarzotep3-front.vercel.app/"],
}))

app.get('/', (req, res)=>{
    res.send("Server running");
})

// ...existing imports and setup...

let ofertasCache = {}; // { [pageNum]: { data: [...], lastUpdated: Date } }
try {
    ofertasCache = JSON.parse(fs.readFileSync('./ofertasCache.json', 'utf-8'));
    console.log('Loaded ofertasCache from file.');
} catch (err) {
    console.warn('No ofertasCache.json found or failed to load.');
}

/* async function scrapeSteam(pageNum = 1) {
    const pagedUrl = `${baseUrl}&page=${pageNum}`;
    let browser;
    try {
       
        // Remove executablePath and let Puppeteer find Chrome itself
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
           
        });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
        await page.goto(pagedUrl, { waitUntil: 'networkidle2' });
        await page.waitForSelector('.search_result_row', { timeout: 10000 });

        const gameList = await page.evaluate(() => {
            const games = Array.from(document.querySelectorAll('a.search_result_row'));
            return games.map(game => {
                const titleSpan = game.querySelector('.title');
                const title = titleSpan ? titleSpan.textContent.trim() : null;
                const url = game.href;
                const img = game.querySelector('.search_capsule img');
                const image = img ? img.src : null;
                const discountDiv = game.querySelector('.discount_pct');
                const discount = discountDiv ? discountDiv.textContent.trim() : null;
                const originalPriceDiv = game.querySelector('.discount_original_price');
                let originalPrice = originalPriceDiv ? originalPriceDiv.textContent.trim() : null;
                if (originalPrice) originalPrice = originalPrice.replace(/^[^\d]+/, '').trim();
                const finalPriceDiv = game.querySelector('.discount_final_price');
                let finalPrice = finalPriceDiv ? finalPriceDiv.textContent.trim() : null;
                if (finalPrice) finalPrice = finalPrice.replace(/^[^\d]+/, '').trim();
                return {
                    title,
                    url,
                    image,
                    discount,
                    originalPrice,
                    finalPrice,
                    description: null
                };
            });
        });

        return gameList;
    } catch (error) {
        console.error("Error scraping Steam:", error);
        return null;
    } finally {
        if (browser) await browser.close();
    }
} */
// Function to update cache for a given page
/* async function updateCache(pageNum = 1) {
    const data = await scrapeSteam(pageNum);
    if (data) {
        ofertasCache[pageNum] = {
            data,
            lastUpdated: new Date()
        };
        console.log(`Cache updated for page ${pageNum} at ${new Date().toISOString()}`);
    }
}

// Update cache for first 3 pages every hour (adjust as needed)
function scheduleCacheUpdates() {
    [1, 2, 3, 4, 5, 6, 7, 8 , 9, 10].forEach(pageNum => {
        updateCache(pageNum); // Initial fetch
        setInterval(() => updateCache(pageNum), 60 * 60 * 1000); // Every hour
    });
}
scheduleCacheUpdates();
 */
app.get('/ofertasp3', (req, res) => {
    const pageNum = parseInt(req.query.page) || 1;
    const cache = ofertasCache[pageNum];
    if (cache && cache.data) {
        res.json(cache.data);
    } else {
        res.status(500).json({ error: 'No data available.' });
    }
});

app.listen(PORT, ()=> {
    console.log("Server running on http://localhost:" + PORT );
})
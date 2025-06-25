import puppeteer from 'puppeteer';
import fs from 'fs';

const baseUrl = "https://store.steampowered.com/search/?maxprice=5&supportedlang=english&specials=1&ndl=1";

async function scrapeSteam(pageNum = 1) {
    const pagedUrl = `${baseUrl}&page=${pageNum}`;
    let browser;
    try {
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
}

async function main() {
    let ofertasCache = {};
    for (let pageNum = 1; pageNum <= 30; pageNum++) {
        console.log(`Scraping page ${pageNum}...`);
        const data = await scrapeSteam(pageNum);
        if (data) {
            ofertasCache[pageNum] = {
                data,
                lastUpdated: new Date()
            };
        }
    }
    fs.writeFileSync('./ofertasCache.json', JSON.stringify(ofertasCache, null, 2));
    console.log('ofertasCache.json generated!');
}

main();
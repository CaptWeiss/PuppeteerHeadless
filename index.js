const fs = require('fs');
const puppeteer = require('puppeteer');


(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    try {
        await page.goto("http://quotes.toscrape.com");
        let urls = await page.evaluate(() => {
            let results = [];
            let items = document.querySelectorAll('div.quote');
            items.forEach((item) => {
                const authorDetails = item.children[1] ; // extracting author detail
                const authorLink = authorDetails.querySelector('a').getAttribute('href'); // get Author About page
                results.push({
                    text: item.querySelector('span.text').innerText,
                    author: authorDetails.querySelector('small.author').innerText, // get author name
                    authorPage: `http://quotes.toscrape.com${authorLink}`
                });
            });
            return results;
        })
        console.log({urls});
        saveToFile(JSON.stringify(urls,null,4));
        await browser.close();
    } catch (error) {
        console.error(error)
    }
})();

function saveToFile(data) {
    fs.writeFile("quotes.txt", data, function (err) {
        if (err) {
            console.log(err);
        }
    });
}
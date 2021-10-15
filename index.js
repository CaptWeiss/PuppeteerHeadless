const fs = require('fs');
const puppeteer = require('puppeteer');

const keyword = process.argv[2];
const medium = process.argv[3]||'book';

const mediums = ['book','news'];

if (!keyword) {
    throw "Please provide a keyword to search for as the first argument";
}
if (!mediums.includes(medium)) {
    throw "Specify you're searching for books or news in the second argument"
}


async function getBooks() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    try {
        await page.goto(`https://www.google.com/search?tbm=bks&q=${keyword}`);
        let urls = await page.evaluate(() => {
            let results = [];
            let items = document.querySelectorAll('div.Yr5TG');
            items.forEach((item) => {
                const bookDetails = item.children[1] ; // extracting author detail
                const link = bookDetails.querySelector('a').getAttribute('href'); // get Author About page
                const title = bookDetails.querySelector('a>h3').innerText; // get book title
                const author = bookDetails.querySelector('div.N96wpd span').innerText; // get book author
                results.push({
                    link,
                    title,
                    author
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
};
async function getNews() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    try {
        await page.goto(`https://www.google.com/search?tbm=nws&q=${keyword}`);
        let urls = await page.evaluate(() => {
            let results = [];
            let items = document.querySelector('div.v7W49e').children;
            [...items].forEach((item) => {
                const link = item.querySelector('a').getAttribute('href'); // get news link
                const channel = item.querySelector('div.CEMjEf span').innerText;
                const title = item.querySelector('a div[role="heading"]').innerText; // get news heading
                results.push({
                    link,
                    channel,
                    title
                });
            });
            return results;
        })
        console.log({ urls });
        saveToFile(JSON.stringify(urls, null, 4));
        await browser.close();
    } catch (error) {
        console.error(error)
    }
};

if (medium==='news') {
    getNews();
} else if (medium==='book') {
    getBooks();
}

function saveToFile(data) {
    const fileSlug = keyword.replace(/\s+/gm, '-').toLowerCase();
    fs.writeFile(`${fileSlug}.json`, data, function (err) {
        if (err) {
            console.log(err);
        }
    });
}
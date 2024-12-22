const puppetter = require('puppeteer');
// Launch the browser and open a new blank page
async function main() {
    const browser = await puppetter.launch({ headless: false });
}
main()
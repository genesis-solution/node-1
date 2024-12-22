const puppeteer = require('puppeteer');
/**
 * @param {string} html
 * @param {puppeteer.PDFOptions} options
 * @returns 
 */
const createHtmlToPDF = async (html, options) => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html);
    const pdf = await page.pdf(options);
    await browser.close();
    return pdf;
};
module.exports = {
    createHtmlToPDF,
};
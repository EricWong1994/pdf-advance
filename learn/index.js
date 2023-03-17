const puppeteer = require('puppeteer');
(async () => {
  const brower = await puppeteer.launch()
  const page = await brower.newPage()
  await page.goto('https://www.baidu.com', { waitUntil: 'networkidle0' })
  const pdf = await page.pdf({ format: 'A4' })
  await brower.close()
  return pdf
})()
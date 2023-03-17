const express = require('express')
const PDFDocument = require('pdfkit')
const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')
const port = 3001

const app = express()
const resolve = pathname => path.resolve(__dirname, pathname)

app.all('*', (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", ' 3.2.1')
  if (req.method == "OPTIONS") res.send(200);/*让options请求快速返回*/
  else next();
})

app.get('/pdf', (req, res) => {
  const doc = new PDFDocument()
  doc.pipe(fs.createWriteStream(resolve('./test.pdf')));
  doc.font(resolve('./font.ttf'))
    .fontSize(30)
    .text('测试添加自定义字体!', 100, 100)
  doc.image(resolve('./image.jpg'), {
    fit: [250, 300],
    align: 'center',
    valign: 'center'
  })
  doc.addPage()
    .fontSize(25)
    .text('Here is some vector graphics...', 100, 100)
  doc.pipe(res);
  doc.end();
})

// 页脚
const footerTemplate = `<div 
        style="width:80%;margin:0 auto;font-size:8px;border-top:1px solid #ddd;padding:10px 0;display: flex; justify-content: space-between; ">
        <span style="">我是页脚</span>
        <div><span class="pageNumber">
        </span> / <span class="totalPages"></span></div>
        </div>`;
// 页眉
const headerTemplate = `<div
        style="width:80%;margin:0 auto;font-size:8px;border-bottom:1px solid #ddd;padding:10px 0;display: flex; justify-content: space-between;">
        <span>我是页眉</span>
        <span>我也是页眉</span>
        </div>`

app.get('/puppeteer', async (req, res) => {
  const printPdf = async () => {
    const brower = await puppeteer.launch()
    const page = await brower.newPage()
    await page.goto('https://cn.vuejs.org/', { waitUntil: 'networkidle0' })
    // await page.goto('https://github.com/linpenghui958', { waitUntil: 'networkidle0'})
    await page.addStyleTag({ content: 'h1{ color: #f00}' })

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      '-webkit-print-color-adjust': 'exact',
      // path: 'static'
      // path: '测试.pdf',
      displayHeaderFooter: true,
      headerTemplate,
      footerTemplate,
      margin: {
        top: 80,
        bottom: 80
      },
    })
    await brower.close()
    return pdf
  }
  const result = await printPdf()
  res.set({ 'Content-Type': 'application/pdf', 'Content-Length': result.length })
  res.send(result)
})

app.listen(port, () => {
  console.log(`listening server on port ${port}`)
})

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless:false});
  const page = await browser.newPage();
  await page.goto('https://lektur.id/daftar-sinonim/');
  const synonimData = await page.evaluate(() => {
  	let links = []
    let linksEl = document.querySelectorAll('.article-post ul li')
    linksEl.forEach((linkelem) => {
      let linkjson = {}
      try {
        linkjson.attribute = linkelem.querySelector('a').text
        linkjson.link = linkelem.querySelector('a').getAttribute('href')

      } catch (exception) {
        console.log('some error was happen')
        console.log(exception)
      }
      links.push(linkjson)
    });
    return links
  })

  //deeper loop
  for (var abj_syn of synonimData) {
    await page.goto(abj_syn.link)
    const AbjWord = await page.evaluate(() => {
      let link_abjword = []
      let AbjWordEl = document.querySelectorAll('.article-post ul li')
      AbjWordEl.forEach(abj_wordel => {
        let abjword_json = {}
        try {
          abjword_json.attribute = abj_wordel.querySelector('a').text
          abjword_json.link = abj_wordel.querySelector('a').getAttribute('href')
        } catch (error) {
          console.log('some error happen')
          console.log(error)
        }
        link_abjword.push(abjword_json)
      });
      return link_abjword
    })

    console.log(AbjWord)
    
  }

  await browser.close();
})();
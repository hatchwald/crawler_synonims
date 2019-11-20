const puppeteer = require('puppeteer');
const jsonfile = require('jsonfile');
const file_json = 'result.json';

(async () => {
    const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage();
    var elements = 'https://lektur.id/sinonim-sama/';
    await page.goto(elements)
    page.setDefaultTimeout(300000)
    var orig_word = elements.split('-').pop().replace(/[^\w\s]/gi, '')
    let arr_temp_synonim = {}
    const all_synonims = await page.evaluate( () => {
        let arr_words = []
        let all_synonim_el = document.querySelectorAll('.article-post ol li')
        all_synonim_el.forEach( el => {
          try {
             arr_words.push(el.querySelector('li a').text)
          } catch (error) {
            console.error(error)
          }
        });
        return arr_words
    })
    arr_temp_synonim[orig_word] = all_synonims
    jsonfile.writeFile(file_json,arr_temp_synonim).then(res =>  {
          console.log('write complete')
    }).catch(error  =>  console.error(error))
    await browser.close();
})();
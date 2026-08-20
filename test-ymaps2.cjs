const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
        <script src="https://api-maps.yandex.ru/2.1/?lang=ru_RU"></script>
    </head>
    <body>
        <div id="map" style="width:500px;height:500px"></div>
        <script>
            ymaps.ready(() => {
                const map = new ymaps.Map('map', {
                    center: [55.76, 37.64],
                    zoom: 10
                });
                console.log("Map created", !!map);
            });
        </script>
    </body>
    </html>
  `);
  
  await new Promise(r => setTimeout(r, 3000));
  await browser.close();
  process.exit(0);
})();

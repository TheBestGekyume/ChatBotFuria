const launchBrowser = require('../../webScraper/browser');

module.exports = async (req, res) => {
  let browser;
  try {
    const { browser: b, page } = await launchBrowser();
    browser = b;

    const url = 'https://draft5.gg/equipe/330-FURIA/resultados';
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForSelector('.MatchCardSimple__MatchContainer-sc-wcmxha-0', { timeout: 10000 });

    const matches = await page.evaluate(() => {
      const result = [];

      const dateEls = document.querySelectorAll('p.MatchList__MatchListDate-sc-1pio0qc-0');

      dateEls.forEach(dateEl => {
        const date = dateEl.innerText.replace('📅', '').trim();
        let sibling = dateEl.nextElementSibling;

        while (sibling && sibling.classList.contains('MatchCardSimple__MatchContainer-sc-wcmxha-0')) {
          const time = sibling.querySelector('.MatchCardSimple__MatchTime-sc-wcmxha-3 span')?.innerText.trim() || '';
          const format = sibling.querySelector('.MatchCardSimple__Badge-sc-wcmxha-18')?.innerText.trim() || '';
          const tournament = sibling.querySelector('.MatchCardSimple__Tournament-sc-wcmxha-34')?.innerText.trim() || '';
          const href = sibling.getAttribute('href');
          const link = href ? `https://draft5.gg${href}` : '';

          const teams = Array.from(sibling.querySelectorAll('.MatchCardSimple__MatchTeam-sc-wcmxha-11')).map(teamEl => {
            const name = teamEl.querySelector('span')?.innerText.trim() || '';
            const logo = teamEl.querySelector('img')?.src || '';
            const score = teamEl.querySelector('.MatchCardSimple__Score-sc-wcmxha-15')?.innerText.trim() || '';
            return { name, logo, score };
          });

          result.push({ date, time, format, tournament, link, teams });

          sibling = sibling.nextElementSibling;
        }
      });

      return result;
    });

    res.json(matches);
  } catch (err) {
    console.error('Erro ao buscar partidas passadas:', err);
    res.status(500).json({ error: 'Erro ao buscar partidas passadas.' });
  } finally {
    if (browser) await browser.close();
  }
};

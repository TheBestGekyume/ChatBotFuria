const launchBrowser = require('../../webScraper/browser');

module.exports = async (req, res) => {
  let browser;
  try {
    const { browser: b, page } = await launchBrowser();
    browser = b;

    const url = 'https://draft5.gg/equipe/330-FURIA/proximas-partidas';
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForSelector('.MatchCardSimple__MatchContainer-sc-wcmxha-0', { timeout: 10000 });

    const matches = await page.evaluate(() => {
      const matchElements = document.querySelectorAll('.MatchCardSimple__MatchContainer-sc-wcmxha-0');
      return Array.from(matchElements).map(match => {
        const time = match.querySelector('.MatchCardSimple__MatchTime-sc-wcmxha-3 span')?.innerText.trim() || '';
        const format = match.querySelector('.MatchCardSimple__Badge-sc-wcmxha-18')?.innerText.trim() || '';
        const tournament = match.querySelector('.MatchCardSimple__Tournament-sc-wcmxha-34')?.innerText.trim() || '';
        const href = match.getAttribute('href');
        const link = href ? `https://draft5.gg${href}` : '';

        const teams = Array.from(match.querySelectorAll('.MatchCardSimple__MatchTeam-sc-wcmxha-11')).map(teamEl => {
          const name = teamEl.querySelector('span')?.innerText.trim() || '';
          const logo = teamEl.querySelector('img')?.src || '';
          return { name, logo };
        });

        return {
          time,
          format,
          tournament,
          link,
          teams
        };
      });
    });

    res.json(matches);
  } catch (err) {
    console.error('Erro ao buscar próximas partidas:', err);
    res.status(500).json({ error: 'Erro ao buscar próximas partidas.' });
  } finally {
    if (browser) await browser.close();
  }
};

const launchBrowser = require('../../webScraper/browser');

module.exports = async (req, res) => {
  let browser;
  try {
    const { browser: b, page } = await launchBrowser();
    browser = b;

    await page.goto('https://draft5.gg/equipe/330-FURIA', { waitUntil: 'domcontentloaded', timeout: 6000 });
    await page.waitForSelector('.PlayerCard__PlayerCardContainer-sc-1u0zx4y-0', { timeout: 6000 });

    const players = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.PlayerCard__PlayerCardContainer-sc-1u0zx4y-0'));
      return cards.map(card => {
        const nameElement = card.querySelector('.PlayerCard__PlayerNickName-sc-1u0zx4y-4');
        const name = nameElement ? nameElement.innerText.trim() : 'Nome não encontrado';

        const flagImage = card.querySelector('.Flag__Flags-sc-paakpi-1')?.src;

        // Tentando obter a imagem do jogador de outra maneira
        const playerImageDiv = card.querySelector('.PlayerCard__PlayerPhoto-sc-1u0zx4y-2');
        let playerImage = null;
        
        if (playerImageDiv) {
          const style = window.getComputedStyle(playerImageDiv);
          playerImage = style.backgroundImage.replace('url("', '').replace('")', '');
        }

        return { name, flagImage, playerImage };
      });
    });

    res.json(players);
  } catch (err) {
    console.error('Erro no scraping do Draft5:', err);
    res.status(500).json({ error: 'Erro ao buscar dados do lineup.' });
  } finally {
    if (browser) await browser.close();
  }
};

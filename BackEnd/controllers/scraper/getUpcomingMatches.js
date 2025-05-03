const launchBrowser = require('../../webScraper/browser');

module.exports = async (req, res) => {
  let browser;
  try {
    const { browser: b, page } = await launchBrowser();
    browser = b;

    const url = 'https://draft5.gg/equipe/330-FURIA/proximas-partidas';
    
    // 1. Navegação com timeout aumentado
    await page.goto(url, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    // 3. Espera explícita pelos elementos
    await page.waitForSelector('.MatchCardSimple__MatchContainer-sc-wcmxha-0', { 
      timeout: 10000 
    });

    // 4. Debug: contar quantos elementos foram encontrados
    const matchCount = await page.$$eval('.MatchCardSimple__MatchContainer-sc-wcmxha-0', els => els.length);

    // 5. Extração dos dados com verificação passo a passo
    const matches = await page.evaluate(() => {
      const matches = [];
      
      // Pega todos os cards de partida
      const matchCards = document.querySelectorAll('.MatchCardSimple__MatchContainer-sc-wcmxha-0');
      
      matchCards.forEach(card => {
        try {
          // Encontra o elemento de data imediatamente anterior
          let prevElement = card.previousElementSibling;
          while (prevElement && !prevElement.classList.contains('MatchList__MatchListDate-sc-1pio0qc-0')) {
            prevElement = prevElement.previousElementSibling;
          }
          const date = prevElement ? prevElement.innerText.replace('📅', '').trim() : 'Data não disponível';

          // Extrai informações básicas
          const timeElement = card.querySelector('.MatchCardSimple__MatchTime-sc-wcmxha-3 span');
          const time = timeElement ? timeElement.innerText.trim() : '';
          
          const formatElement = card.querySelector('.MatchCardSimple__Badge-sc-wcmxha-18');
          const format = formatElement ? formatElement.innerText.trim() : '';
          
          const tournamentElement = card.querySelector('.MatchCardSimple__Tournament-sc-wcmxha-34');
          const tournament = tournamentElement ? tournamentElement.innerText.trim() : '';
          
          const link = card.getAttribute('href') ? `https://draft5.gg${card.getAttribute('href')}` : '';

          // Extrai times
          const teamElements = card.querySelectorAll('.MatchCardSimple__MatchTeam-sc-wcmxha-11');
          const teams = [];
          
          teamElements.forEach(team => {
            const nameElement = team.querySelector('.MatchCardSimple__TeamNameAndLogo-sc-wcmxha-40 span');
            const logoElement = team.querySelector('.TeamLogo__Image-sc-3kie7v-1');
            const scoreElement = team.querySelector('.MatchCardSimple__Score-sc-wcmxha-15');
            
            teams.push({
              name: nameElement ? nameElement.innerText.trim() : '',
              logo: logoElement ? logoElement.src : '',
              score: scoreElement ? scoreElement.innerText.trim() : '0'
            });
          });

          matches.push({
            date,
            time,
            format,
            tournament,
            link,
            teams
          });
        } catch (error) {
          console.error('Erro ao processar card:', error);
        }
      });
      
      return matches;
    });

    // 6. Verificação final
    if (matches.length === 0) {
      console.warn('Nenhuma partida encontrada - verificando conteúdo...');
      const htmlContent = await page.content();
      console.log(htmlContent.substring(0, 1000)); // Mostra parte do HTML para debug
    }

    res.json(matches.length > 0 ? matches : { error: 'Nenhuma partida encontrada', debug: true });

  } catch (err) {
    console.error('Erro no scraping:', err);
    res.status(500).json({ 
      error: 'Erro ao buscar partidas',
      details: err.message
    });
  } finally {
    if (browser) await browser.close();
  }
};
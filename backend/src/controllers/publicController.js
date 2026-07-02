const https = require('https');

// GET /api/news - javni servis integracija
const getNews = async (req, res) => {
  try {
    // Koristi NewsAPI za preuzimanje vesti o kulinarstvu
    // U produkciji bi API ključ bio u .env fajlu
    const apiKey = process.env.NEWS_API_KEY || 'demo';
    const url = `https://newsapi.org/v2/everything?q=hrana%20OR%20recepti%20OR%20kuvanje&language=sr&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`;

    https.get(url, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const parsed = JSON.parse(data);

          if (parsed.status === 'error') {
            // Fallback: vrati demo vesti ako API nije dostupan
            return res.json({
              source: 'Demo vesti (NewsAPI nedostupan)',
              articles: [
                {
                  title: 'Novi trendovi u srpskoj kuhinji',
                  description: 'Mladi kuvari donose svež pristup tradicionalnim receptima.',
                  url: 'https://example.com/vesti/1',
                  publishedAt: new Date().toISOString()
                },
                {
                  title: 'Sezonsko voće i povrće - šta kupiti u junu',
                  description: 'Vodič kroz najbolje sezonske namirnice za jun 2026.',
                  url: 'https://example.com/vesti/2',
                  publishedAt: new Date().toISOString()
                },
                {
                  title: 'Kako napraviti savršen hleb kod kuće',
                  description: 'Saveti profesionalnih pekara za domaći hleb sa hrskavom koricom.',
                  url: 'https://example.com/vesti/3',
                  publishedAt: new Date().toISOString()
                }
              ]
            });
          }

          // Obrada podataka - dodajemo našu kategorizaciju
          const processed = {
            source: 'NewsAPI - Kulinarske vesti',
            articles: (parsed.articles || []).map(article => ({
              title: article.title,
              description: article.description,
              url: article.url,
              publishedAt: article.publishedAt,
              category: article.title?.toLowerCase().includes('recept') ? 'Recepti' :
                        article.title?.toLowerCase().includes('hrana') ? 'Ishrana' : 'Kulinarstvo'
            }))
          };

          res.json(processed);
        } catch (parseErr) {
          res.status(500).json({ message: 'Greška pri obradi podataka javnog servisa.' });
        }
      });
    }).on('error', (err) => {
      // Fallback na demo podatke ako mreža nije dostupna
      res.json({
        source: 'Demo vesti (offline fallback)',
        articles: [
          {
            title: 'Novi trendovi u srpskoj kuhinji',
            description: 'Mladi kuvari donose svež pristup tradicionalnim receptima.',
            url: 'https://example.com/vesti/1',
            publishedAt: new Date().toISOString(),
            category: 'Recepti'
          },
          {
            title: 'Sezonsko voće i povrće - šta kupiti u junu',
            description: 'Vodič kroz najbolje sezonske namirnice za jun 2026.',
            url: 'https://example.com/vesti/2',
            publishedAt: new Date().toISOString(),
            category: 'Ishrana'
          },
          {
            title: 'Kako napraviti savršen hleb kod kuće',
            description: 'Saveti profesionalnih pekara za domaći hleb sa hrskavom koricom.',
            url: 'https://example.com/vesti/3',
            publishedAt: new Date().toISOString(),
            category: 'Kulinarstvo'
          }
        ]
      });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getNews };

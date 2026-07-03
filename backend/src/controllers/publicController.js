const https = require('https');

// GET /api/news - javni servis integracija (NewsAPI)
const getNews = async (req, res) => {
  try {
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
            return res.json({
              source: 'Demo vesti (NewsAPI nedostupan)',
              articles: [
                {
                  title: 'Novi trendovi u srpskoj kuhinji',
                  description: 'Mladi kuvari donose svez pristup tradicionalnim receptima.',
                  url: 'https://example.com/vesti/1',
                  publishedAt: new Date().toISOString()
                },
                {
                  title: 'Sezonsko voce i povrce - sta kupiti u junu',
                  description: 'Vodic kroz najbolje sezonske namirnice za jun 2026.',
                  url: 'https://example.com/vesti/2',
                  publishedAt: new Date().toISOString()
                },
                {
                  title: 'Kako napraviti savrsen hleb kod kuce',
                  description: 'Saveti profesionalnih pekara za domaci hleb sa hrskavom koricom.',
                  url: 'https://example.com/vesti/3',
                  publishedAt: new Date().toISOString()
                }
              ]
            });
          }

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
          res.status(500).json({ message: 'Greska pri obradi podataka javnog servisa.' });
        }
      });
    }).on('error', (err) => {
      res.json({
        source: 'Demo vesti (offline fallback)',
        articles: [
          { title: 'Novi trendovi u srpskoj kuhinji', description: 'Mladi kuvari donose svez pristup tradicionalnim receptima.', url: 'https://example.com/vesti/1', publishedAt: new Date().toISOString(), category: 'Recepti' },
          { title: 'Sezonsko voce i povrce - sta kupiti u junu', description: 'Vodic kroz najbolje sezonske namirnice za jun 2026.', url: 'https://example.com/vesti/2', publishedAt: new Date().toISOString(), category: 'Ishrana' },
          { title: 'Kako napraviti savrsen hleb kod kuce', description: 'Saveti profesionalnih pekara za domaci hleb sa hrskavom koricom.', url: 'https://example.com/vesti/3', publishedAt: new Date().toISOString(), category: 'Kulinarstvo' }
        ]
      });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/random-meal - drugi javni servis (TheMealDB)
const getRandomMeal = (req, res) => {
  const url = 'https://www.themealdb.com/api/json/v1/1/random.php';

  https.get(url, (response) => {
    let data = '';

    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        const meal = parsed.meals?.[0];

        if (!meal) {
          return res.json({
            source: 'Demo recept (TheMealDB nedostupan)',
            meal: {
              name: 'Sopska salata',
              category: 'Vegetarian',
              area: 'Serbian',
              instructions: 'Iseckajte paradajz, krastavac, crni luk i papriku. Dodajte sir, maslinovo ulje i so. Promesajte i sluzite.',
              image: '',
              tags: 'Salad,Vegetarian',
              sourceUrl: '#'
            }
          });
        }

        res.json({
          source: 'TheMealDB',
          meal: {
            name: meal.strMeal,
            category: meal.strCategory,
            area: meal.strArea,
            instructions: meal.strInstructions,
            image: meal.strMealThumb,
            tags: meal.strTags,
            sourceUrl: meal.strSource || meal.strYoutube || '#'
          }
        });
      } catch (parseErr) {
        res.status(500).json({ message: 'Greska pri obradi podataka TheMealDB servisa.' });
      }
    });
  }).on('error', (err) => {
    res.json({
      source: 'Demo recept (offline fallback)',
      meal: {
        name: 'Sopska salata',
        category: 'Vegetarian',
        area: 'Serbian',
        instructions: 'Iseckajte paradajz, krastavac, crni luk i papriku. Dodajte sir, maslinovo ulje i so. Promesajte i sluzite.',
        image: '',
        tags: 'Salad,Vegetarian',
        sourceUrl: '#'
      }
    });
  });
};

module.exports = { getNews, getRandomMeal };

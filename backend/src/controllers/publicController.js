const https = require('https');

// GET /api/meal-search - TheMealDB search (no API key)
const getMealSearch = (req, res) => {
  const query = req.query.q || 'chicken';
  const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`;

  https.get(url, (response) => {
    let data = '';

    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        const meals = parsed.meals || [];

        if (meals.length === 0) {
          return res.json({
            source: 'Demo recepti (TheMealDB - nema rezultata)',
            articles: [
              {
                title: 'Sopska salata',
                description: 'Tradicionalna srpska salata od svezeg povrca i sira.',
                url: 'https://www.themealdb.com/meal/52772',
                publishedAt: new Date().toISOString(),
                image: ''
              },
              {
                title: 'Cevapi',
                description: 'Mala valjkasta jela od mlevenog mesa sa lukom.',
                url: 'https://www.themealdb.com/meal/52772',
                publishedAt: new Date().toISOString(),
                image: ''
              },
              {
                title: 'Palacinke',
                description: 'Tanke palacinke punjene dzemom ili cokoladom.',
                url: 'https://www.themealdb.com/meal/52772',
                publishedAt: new Date().toISOString(),
                image: ''
              }
            ]
          });
        }

        const articles = meals
          .slice(0, 6)
          .map(m => ({
            title: m.strMeal,
            description: `${m.strCategory} - ${m.strArea} cuisine`,
            url: m.strSource || m.strYoutube || `https://www.themealdb.com/meal/${m.idMeal}`,
            publishedAt: new Date().toISOString(),
            image: m.strMealThumb || ''
          }));

        res.json({
          source: `TheMealDB - Rezultati za "${query}"`,
          articles
        });
      } catch (parseErr) {
        res.status(500).json({ message: 'Greska pri obradi podataka TheMealDB servisa.' });
      }
    });
  }).on('error', (err) => {
    res.json({
      source: 'Demo recepti (offline fallback)',
      articles: [
        { title: 'Sopska salata', description: 'Tradicionalna srpska salata od svezeg povrca i sira.', url: 'https://www.themealdb.com/meal/52772', publishedAt: new Date().toISOString(), image: '' },
        { title: 'Cevapi', description: 'Mala valjkasta jela od mlevenog mesa sa lukom.', url: 'https://www.themealdb.com/meal/52772', publishedAt: new Date().toISOString(), image: '' },
        { title: 'Palacinke', description: 'Tanke palacinke punjene dzemom ili cokoladom.', url: 'https://www.themealdb.com/meal/52772', publishedAt: new Date().toISOString(), image: '' }
      ]
    });
  });
};

// GET /api/random-meal - TheMealDB random (no API key)
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

module.exports = { getMealSearch, getRandomMeal };

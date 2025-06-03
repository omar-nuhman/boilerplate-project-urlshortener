require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

let urlDatabase = [];
let id = 1;



app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;
const urlRegex = /^https?:\/\/([\w-]+\.)*[\w-]+\.[a-zA-Z0-9]{1,}(:[0-9]+)?(\/.*)?$/;  // Check if URL matches the expected format
  if (!urlRegex.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  try {
    const parsedUrl = new URL(originalUrl);

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return res.status(400).json({ error: 'invalid url' });
    }

    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }

      const short_url = id++;
      urlDatabase.push({ original_url: originalUrl, short_url });

      return res.json({ original_url: originalUrl, short_url });
    });

  } catch (error) {
    console.error('Error processing URL:', error);
    return res.json({ error: 'invalid url' });
  }
});


// Your first API endpoint
app.get('/api/shorturl/:short_url', (req, res) => {
  const short = parseInt(req.params.short_url);
  const entry = urlDatabase.find(item => item.short_url === short);

  if (entry) {
    res.redirect(entry.original_url);
  } else {
    res.status(400).json({ error: 'invalid url' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

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

app.post('/api/shorturl', function (req, res) {
  const originalUrl = req.body.url;

  // Lightweight protocol + hostname check
  const basicHttpRegex = /^https?:\/\/[^ "]+$/;
  if (!basicHttpRegex.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(originalUrl);
  } catch (e) {
    return res.json({ error: 'invalid url' });
  }

  // Additional check: only http or https
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return res.json({ error: 'invalid url' });
  }

  // Check DNS
  dns.lookup(parsedUrl.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    const existing = urlDatabase.find(entry => entry.original_url === originalUrl);
    if (existing) {
      return res.json(existing);
    }

    const short_url = id++;
    const newEntry = { original_url: originalUrl, short_url };
    urlDatabase.push(newEntry);
    res.json(newEntry);
  });
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

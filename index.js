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
  const OriginalUrl = req.body.url;
  try{
    const parsedUrl = new URL(OriginalUrl);
    if(parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:'){
      return res.status(400).json({ error: 'Invalid URL' });
    }

    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) {
        return res.status(400).json({ error: 'invalid url' });
      }

    const shortUrl = id++;

    urlDatabase.push({ originalUrl: OriginalUrl, shortUrl });

    return res.json({ original_url: OriginalUrl, short_url: shortUrl });
    }
    );

    

  }catch (error) {
    console.error('Error processing URL:', error);
    return res.status(500).json({ error: 'invalid url' });
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

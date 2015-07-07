'use strict';

function noOptions () {
  console.info('Set options first!');
}

function getDataApiUrl(apiKey, videoId) {
  return 'https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' + videoId + '&key=' + apiKey;
}

function isLiveVideo(apiKey, videoId) {
  return Q.xhr.get(getDataApiUrl(apiKey, videoId))
    .then(function (response) {
      return response.data.items[0].snippet.liveBroadcastContent === 'live';
    });
}

function getVideoInfo(property) {
  return document.querySelector('meta[itemprop="' + property + '"').content;
}

function getCapiUrl (apiKey, search, isLive) {
  search = search.replace(':', '');

  var url = 'https://content.guardianapis.com/search?api-key=' + apiKey;

  if (isLive) {
    url = url + '&tags=tone/minutebyminute&show-fields=liveBloggingNow';
  }
  else {
    url = url + '&order-by=relevance&use-date=published&q=' + search;
  }

  return encodeURI(url);
}

function queryCapi (apiKey, videoTitle, isLive) {
  Q.xhr.get(getCapiUrl(apiKey, videoTitle, isLive))
    .then(function (response) {
      var articles = response.data.response.results;

      if (isLive) {
        articles = articles.filter(function (article) {
          return article.fields.liveBloggingNow === 'true';
        });
      }

      console.log(articles);

      Q.xhr.get(chrome.extension.getURL('templates/gu-links.hbs'))
        .then(function (tmpl) {
          var compiledTemplate = Handlebars.compile(tmpl.data);
          var template = compiledTemplate({
            isLive: isLive,
            results: articles
          });

          var watchHeader = document.querySelector('#watch-header');

          var el = document.createElement('div');
          el.innerHTML = template;

          watchHeader.appendChild(el);
        });
    });
}

function init (settings) {
  var videoId = getVideoInfo('videoId');
  var videoTitle = getVideoInfo('name');

  isLiveVideo(settings.youtubeAPIKey, videoId)
    .then(function (isLive) {
      queryCapi(settings.capiKey, videoTitle, isLive);
    });
}

function getSettings () {
  chrome.storage.sync.get({
    youtubeAPIKey: '',
    capiKey: ''
  }, function(settings) {
    if (settings.youtubeAPIKey.length === 0 || settings.capiKey.length === 0) {
      noOptions();
    }
    else {
      init(settings);
    }
  });
}

getSettings();
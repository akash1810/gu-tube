'use strict';

function saveOptions() {
  var youtubeApiKey = document.getElementById('api-key__youtube').value;
  var capiKey = document.getElementById('api-key__capi').value;
  chrome.storage.sync.set({
    youtubeAPIKey: youtubeApiKey,
    capiKey: capiKey
  }, function() {
    var status = document.getElementById('status');
    status.textContent = 'Saved!';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function restoreOptions() {
  chrome.storage.sync.get({
    youtubeAPIKey: '',
    capiKey: ''
  }, function(items) {
    document.getElementById('api-key__youtube').value = items.youtubeAPIKey;
    document.getElementById('api-key__capi').value = items.capiKey;

    if (items.youtubeAPIKey.length > 0) {
      document.querySelector('label[for="api-key__youtube"]').style.display = 'none';
    }

    if (items.capiKey.length > 0) {
      document.querySelector('label[for="api-key__capi"]').style.display = 'none';
    }
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
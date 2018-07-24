var Dropbox = require('./dropbox');
var Img = require('./img');

document.addEventListener('DOMContentLoaded', function(){
    var drop = new Dropbox(document.getElementById('dropbox'));
    var img = new Img(document.getElementById('downloadBtn'));
    drop.addDropHandler(function(urls) {
        img.load_urls(urls);
    });
});
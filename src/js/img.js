var Img = (function() {
    // browserify workaround?? not compressed (I think?)
    (typeof window !== 'undefined' ? window : {}).pdfjsWorker = require('pdfjs-dist/build/pdf.worker');
    var Pdfjs = require('pdfjs-dist');
    Pdfjs.workerSrc = require('pdfjs-dist/build/pdf.worker.js');

    var Img = function(el) {
        this._el = el; // button
        // create dummy canvas to render with
    }
    Img.prototype.load_urls = function(urls) {
        if (urls.length === 0) {
            throw new Error('urls cannot be of length zero');
        }
        this.change_button(false, 'Loading...');
        var _this = this;
        Pdfjs.getDocument({url: urls[0]}).then(function(pdf_doc) {
            _this.change_button(true, 'Download ' + pdf_doc.numPages + ' pages');
        }).catch(function(error) {
            _this.change_button(false, 'Error: ' + error.message);
        });
    }
    Img.prototype.change_button = function(enabled, message) {
        if (enabled) {
            this._el.removeAttribute('disabled');
        }
        else {
            this._el.setAttribute('disabled', true);
        }
        this._el.innerHTML = message;
    }
    return Img;
})();

module.exports = Img;
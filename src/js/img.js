var Img = (function() {
    // browserify workaround?? not compressed (I think?)
    (typeof window !== 'undefined' ? window : {}).pdfjsWorker = require('pdfjs-dist/build/pdf.worker');
    var Pdfjs = require('pdfjs-dist');
    var JSZip = require('jszip');
    var FileSaver = require('file-saver');
    Pdfjs.workerSrc = require('pdfjs-dist/build/pdf.worker.js');
    var a = document.createElement('a');
    var SCALE = 2;
    var WORKERS = 1;

    var Img = function(el) {
        this._el = el; // button
        this._$el = $(el);
        this._add_click_events();
        this.pdf_doc = false;
    }
    Img.prototype.load_urls = function(urls) {
        if (urls.length === 0) {
            throw new Error('urls cannot be of length zero');
        }
        this.change_button(false, 'Loading...');
        var _this = this;
        Pdfjs.getDocument({url: urls[0]}).then(function(pdf_doc) {
            _this.change_button(true, 'Download ' + pdf_doc.numPages + ' pages');
            _this.pdf_doc = pdf_doc;

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
    Img.prototype._add_click_events = function() {
        var _this = this;
        this._$el.on('click', function() {
            var zip = new JSZip();
            if (_this.pdf_doc === false) {
                throw new Error('pdf_doc must be loaded before downloading...');
            }
            var pages = [];
            window.pages = pages;
            var numPages = _this.pdf_doc.numPages;
            var rem = numPages;
            function addPage(i, end, interval, canvas, ctx) {
                _this.pdf_doc.getPage(i).then(function(page) {
                    var viewport = page.getViewport(SCALE);
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    var renderContext = {
                        canvasContext: ctx,
                        viewport: viewport,
                    };
                    page.render(renderContext).then(function() {
                        pages[i-1] = canvas.toDataURL('image/jpg', 0.92);
                        rem -= 1;
                        _this.change_button(false, rem);
                        $(a).attr('href', pages[i-1]).attr('download', 'page'+i+'.jpg');
                        zip.file('page'+i+'.jpg', pages[i-1].split('base64,')[1], {base64: true});
                        //document.body.appendChild(a);
                        //a.click();
                        //document.body.removeChild(a);
                        //canvas.width = canvas.height = 0;
                        if (i+interval <= end) addPage(i+interval, end, WORKERS, canvas, ctx);
                        else workerDone();
                    });
                });
            }

            _this.change_button(false, rem);
            Pdfjs.disableWorker = true;
            workersRunning = 0;
            for (var i = 1; i <= WORKERS; i++) {
                if (i < numPages) {
                    workersRunning += 1;
                    var canvas = document.createElement('canvas');
                    var ctx = canvas.getContext('2d');
                    addPage(i, numPages, WORKERS, canvas, ctx);
                }
            }
            function workerDone() {
                workersRunning--;
                if (workersRunning === 0) {
                    _this.change_button(false, 'Upload file.');
                    zip.generateAsync({type:"blob"}).then(function(content) {
                        FileSaver.saveAs(content, "images.zip");
                    });
                }
            }
        });
    };
    return Img;
})();

module.exports = Img;
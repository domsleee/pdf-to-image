var Img = (function() {
    var Pdfjs = require('pdfjs-dist');
    Pdfjs.GlobalWorkerOptions.workerSrc = 'js/pdf.worker.bundle.js';

    //Pdfjs.disableWorker = false;
    var JSZip = require('jszip');
    var FileSaver = require('file-saver');
    var a = document.createElement('a');
    var SCALE = 2;
    var WORKERS = 1;
    var rem = 0;

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
            var numPages = _this.pdf_doc.numPages;
            var rem = numPages;
            _this.change_button(false, rem);
            workers_running = 0;
            for (var i = 1; i <= WORKERS; i++) {
                workers_running += 1;
                worker = new Worker(i, numPages, WORKERS, _this, worker_add_image, worker_done);
                worker.add_all_pages();
            }
            function worker_add_image(i, url) {
                rem -= 1;
                _this.change_button(false, rem);
                zip.file(i+'.jpg', url.split('base64,')[1], {base64: true});
            }
            function worker_done() {
                workers_running--;
                if (workers_running === 0) {
                    _this.change_button(false, 'Upload file.');
                    zip.generateAsync({type:"blob"}).then(function(content) {
                        FileSaver.saveAs(content, "images.zip");
                    });
                }
            }
        });
    }

    // calls `add_image` for every `k`th page in range [`start`, `end`],
    // calling `finished` on completion
    var Worker = function(start, end, k, img, add_image, finished) {
        this.start = start;
        this.end = end;
        this.k = k;
        this.finished = finished;
        this.add_image = add_image;
        this.pdf_doc = img.pdf_doc;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }
    Worker.prototype.add_all_pages = function() {
        this._add_page(this.start);
    }
    Worker.prototype._add_page = function(i) {
        if (i > this.end) { this.finished(); return; }
        var _this = this;
        this.pdf_doc.getPage(i).then(function(page) {
            var viewport = page.getViewport(SCALE);
            _this.canvas.width = viewport.width;
            _this.canvas.height = viewport.height;
            var renderContext = {
                canvasContext: _this.ctx,
                viewport: viewport,
            };
            page.render(renderContext).then(function() {
                var url = _this.canvas.toDataURL('image/jpg', 0.92);
                _this.add_image(i, url);
                _this._add_page(i+_this.k);
            });
        });
    };
    return Img;
})();

module.exports = Img;
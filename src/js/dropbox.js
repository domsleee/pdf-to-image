var Dropbox = (function() {
    var Dropbox = function(el) {
        this._el = el;
        this._dropHandlers = [];
        this._addDragEvents();
        this._addClickEvents();
    }
    Dropbox.prototype._addDragEvents = function() {
        var el = this._el;
        var _this = this;
        el.addEventListener('dragover', function(e) {
            e.preventDefault();
            el.classList.add('over');
        });
        el.addEventListener('dragleave', function(e) {
            el.classList.remove('over');
        });
        el.addEventListener('drop', function(e) {
            e.preventDefault();
            el.classList.remove('over');
            _this._handleFileList(e.dataTransfer.files);
        }, false);
    }
    Dropbox.prototype._addClickEvents = function() {
        var el = this._el;
        var _this = this;
        var fd = el.querySelector('.fileDialog');

        el.addEventListener('click', function(e) {
            fd.click();
        });
        fd.addEventListener('change', function(e) {
            _this._handleFileList(e.target.files);
        }, false);
    }
    Dropbox.prototype._handleFileList = function(files) {
        if (files[0].type !== 'application/pdf') {
            ('not a pdf file!');
            return;
        }
        var i, urls = [];
        for (i = 0; i < files.length; i++) urls.push(URL.createObjectURL(files[i]));
        for (i = 0; i < this._dropHandlers.length; i++)
            this._dropHandlers[i](urls);
    }
    Dropbox.prototype.addDropHandler = function(handle) {
        this._dropHandlers.push(handle);
    }
    return Dropbox;
})();

module.exports = Dropbox;
import { Log } from './logger.js'
import { Utils } from './utils.js'
const TAG = "file-uploader";

class FileUploader {
    constructor() {
        this.mID = 'fu-' + Utils.uuid();

        let tmpl = document.getElementById('file-upload-template').innerHTML;
        let n = Utils.generateNode(tmpl, {
            'fu-id': this.mID,
        });
        
        document.querySelector('body').append(n);
        document.querySelector('[type=file]').addEventListener("change", function(e) {
            Log(TAG, 'changed');
	
			var file = e.target.files[0];
			Papa.parse(file, {
				header: true,
				dynamicTyping: true,
				complete: function(results) {
					console.log(results);
					//printPapaObject(results);
				}
			});
		});
	}

	show() {
		Log(TAG, "Showing " + this.mID);
		document.querySelector('[type=file]').click();
	}
}

export { FileUploader }

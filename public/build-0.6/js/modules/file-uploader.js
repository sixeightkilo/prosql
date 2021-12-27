import { Logger } from './logger.js'
import { Constants } from './constants.js'
import { Utils } from './utils.js'
import { PubSub } from './pubsub.js'
const TAG = "file-uploader";

class FileUploader {
    constructor() {
        //todo: get rid of the fu thing. not required
        this.mID = 'fu-' + Utils.uuid();

        let tmpl = document.getElementById('file-upload-template').innerHTML;
        let n = Utils.generateNode(tmpl, {
            'fu-id': this.mID,
        });
        
        document.querySelector('body').append(n);
        document.querySelector('[type=file]').addEventListener("change", (e) => {
            Logger.Log(TAG, 'changed');
	
            if (e.target.files.length > 0) {
                let reader = new FileReader();
                reader.readAsText(e.target.files[0]);

                reader.addEventListener('load', () => {
                    try {
                        let result = JSON.parse(reader.result);
                        PubSub.publish(Constants.FILE_UPLOADED, result);
                    } catch (e) {
                        alert(e);
                        return;
                    } finally {
                        //self destruct
                        document.querySelector(`#${this.mID}`).remove();
                    }
                });
            }
        });
    }

    show() {
        Logger.Log(TAG, "Showing " + this.mID);
        document.querySelector('[type=file]').click();
    }
}

export { FileUploader }

class MyUploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }
  _initRequest() {
    const assess_token = [TOKEN];
    const xhr = (this.xhr = new XMLHttpRequest());
    xhr.open('POST', 'https://api.imgur.com/3/image/');
    xhr.setRequestHeader('authorization', `Bearer ${assess_token}`);
    xhr.responseType = 'json';
  }
  _initListeners(resolve, reject, file) {
    const xhr = this.xhr;
    const loader = this.loader;
    const genericErrorText = `Couldn't upload file: ${file.name}.`;

    xhr.addEventListener('error', () => reject(genericErrorText));
    xhr.addEventListener('abort', () => reject());
    xhr.addEventListener('load', () => {
      const response = xhr.response;

      if (!response || response.error || !response.success) {
        return reject(
          response && response.error ? response.error.message : genericErrorText
        );
      }

      resolve({
        default: response.data.link,
      });
    });

    if (xhr.upload) {
      xhr.upload.addEventListener('progress', (evt) => {
        if (evt.lengthComputable) {
          loader.uploadTotal = evt.total;
          loader.uploaded = evt.loaded;
        }
      });
    }
  }
  _sendRequest(file) {
    const data = new FormData();
    data.append('image', file);
    data.append('type', 'file');
    this.xhr.send(data);
  }
  upload() {
    return this.loader.file.then(
      (file) =>
        new Promise((resolve, reject) => {
          console.log(file);
          this._initRequest();
          this._initListeners(resolve, reject, file);
          this._sendRequest(file);
        })
    );
  }
  abort() {
    if (this.xhr) {
      this.xhr.abort();
    }
  }
}
function MyCustomUploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
    return new MyUploadAdapter(loader);
  };
}



       CLIENT        STANDALONE          UI
    ____________    ____________    ____________

      config ------>

                            <------ click
            <------ setup
       ready ------>
            <------ preview/capture
    rendered ------>
                .
            <------ teardown



       CLIENT         CLI-PAGE          CLI
    ____________    ____________    ____________

      config ------>
                         started ---->
            <------ setup
       ready ------>
            <------ capture
    rendered ------>
                          upload ---->
                .
            <------ teardown
                            done ---->



      SHADERTOY         CLI
    ____________    ____________

            <------ start
         started ---->
          upload ---->
            done ---->



page
----


control
-------

// const client = new ClientConnection();

// const counter = new Counter(config);

// const captureAll = async () => {
//     let image, name;
//     for({ milliseconds, quad } of counter) {
//         image = await client.capture(milliseconds, quad);
//         name = saveName(config, counter);
//         await save(image, name);
//     }
// }


// client.setup(width, height).then(captureAll).then(client.teardown)


const { Readable } = require('stream');

const captureAll = (counter, client) => {
  counter.start();
  return new Readable({
    read() {
      const { milliseconds, quad } = counter.next();
      client.capture(milliseconds, quad)
        .then(this.push)
    }
  }); 
}


// STANDALONE

const client = new ClientConnection();
client.init(url).then((config) => {

  const start = () => {
    const counter = new Counter(config);
    const save = new DownloadSaver(config.prefix, counter.totalFrames);
    capture = captureAll(counter, client);
    capture.pipe(save).end(() => {
      client.teardown();

      // enable start
      start.once('click', start);
    });  

    stop.once('click', capture.pause);

    // disable start
    // enable stop
  }

  // populate form, enable buttons
  start.once('click', start);
})



// CLI-PAGE

// listen for cli exit

const client = new ClientConnection();
client.init(url).then((config) => {
  
  // send cli started signal

  const counter = new Counter(config);
  const save = new UploadSaver(config.prefix, counter.totalFrames);
  capture = captureAll(counter, client);
  capture.pipe(save).end(() => {
    client.teardown();

    // send cli exit signal
  });
})





// SHADERTOY

const client = new Client(canvas, setup, teardown, render, config);
  
// FORM

const start = () => {
  const counter = new Counter(config);
  const save = new DownloadSaver(config.prefix, counter.totalFrames);
  capture = captureAll(counter, client);
  capture.pipe(save).end(() => {
    client.teardown();

    // enable start
    start.once('click', start);
  });  

  stop.once('click', capture.pause);

  // disable start
  // enable stop
}

// populate form, enable buttons
start.once('click', start);


// CLI

wsevents.on('start', (config) => {
  // listen for cli exit
  
  // send cli started signal

  const counter = new Counter(config);
  const save = new UploadSaver(config.prefix, counter.totalFrames);
  capture = captureAll(counter, client);
  capture.pipe(save).end(() => {
    client.teardown();

    // send cli exit signal
  });
})





// STANDALONE

const client = new ClientConnection();
client.init(url).then((config) => {

  const start = () => {
    const counter = new Counter(config);
    const save = new DownloadSaver(config.prefix, counter.totalFrames);
    capture = captureAll(counter, client);
    capture.pipe(save).end(() => {
      client.teardown();

      // enable start
      start.once('click', start);
    });  

    stop.once('click', capture.pause);

    // disable start
    // enable stop
  }

  // populate form, enable buttons
  start.once('click', start);
})



// CLI-PAGE

// listen for cli exit

const client = new ClientConnection();
client.init(url).then((config) => {
  
  // send cli started signal

  const counter = new Counter(config);
  const save = new UploadSaver(config.prefix, counter.totalFrames);
  capture = captureAll(counter, client);
  capture.pipe(save).end(() => {
    client.teardown();

    // send cli exit signal
  });
})





// SHADERTOY

const client = new Client(canvas, setup, teardown, render, config);
  
// FORM

const start = () => {
  const counter = new Counter(config);
  const save = new DownloadSaver(config.prefix, counter.totalFrames);
  capture = captureAll(counter, client);
  capture.pipe(save).end(() => {
    client.teardown();

    // enable start
    start.once('click', start);
  });  

  stop.once('click', capture.pause);

  // disable start
  // enable stop
}

// populate form, enable buttons
start.once('click', start);


// CLI

wsevents.on('start', (config) => {
  // listen for cli exit
  
  // send cli started signal

  const counter = new Counter(config);
  const save = new UploadSaver(config.prefix, counter.totalFrames);
  capture = captureAll(counter, client);
  capture.pipe(save).end(() => {
    client.teardown();

    // send cli exit signal
  });
})






// NEW


const capture = async (config, client, save) => {

  await client.setup();

  const counter = new Counter(config);
  
  const captureStream = new Readable({
    read() {
      const { frameIndex, milliseconds, quad } = counter.next();
      client.capture(milliseconds, quad)
        .then((blob) => {
          this.push({ frameIndex, quad, blob });
        })
        .catch(this.destroy);
    }
  }); 

  const saveStream = new Writable({
    write({ frameIndex, quad, blob }, encoding, callback) {
      const name = saveName(config.prefix, frameIndex, config.quads, quad);
      save(blob, name)
        .then(() => { callback(); })
        .catch(callback);
    },
  });
  
  return new Promise((resolve, reject, onCancel) => {
    const stream = captureStream.pipe(saveStream);
    stream.end(() => {
      client.teardown();
      resolve();
    });
    stream.on('error', reject);
    onCancel(stream.pause);
  });
}


// save takes blob and filename
const job = capture(config, client, save)
job.then(() => {
  // send cli exit signal
})
job.cancel();






















const createCaptureStream = (capture, next) => {
  return new Readable({
    read() {
      const { frameIndex, milliseconds, quad } = next();
      capture(milliseconds, quad)
        .then((blob) => {
          this.push({ frameIndex, quad, blob });
        })
        .catch(this.destroy);
    }
  }); 
};


const createSaveStream = (save, prefix, quads) => {
  return new Writable({
    write({ frameIndex, quad, blob }, encoding, callback) {
      const name = saveName(prefix, frameIndex, quads, quad);
      save(blob, name)
        .then(() => { callback(); })
        .catch(callback);
    },
  });
};


const startCapture = async (config, client, save) => {

  await client.setup();

  const counter = new Counter(config);
  
  const captureStream = createCaptureStream(client.capture, counter.next);

  const saveStream = createSaveStream(save, config.prefix, config.quads);

  const stream = captureStream.pipe(saveStream);

  return new Promise((resolve, reject, onCancel) => {
    stream.end(() => {
      client.teardown();
      resolve();
    });
    stream.on('error', reject);
    onCancel(stream.pause);
  });
};


const previewLoop = (preview, next, frameDuration, onCancel) => {
  let timeout;
  const loop = () => {
    const { milliseconds } = next();
    preview(milliseconds);
    timeout = setTimeout(loop, frameDuration * 1000);  
  }
  loop();
  onCancel(() => {
    clearTimeout(timeout);
  });
} 



const startPreview = async (config, client) => {

  await client.setup();

  const counter = new LoopingCounter(config);

  return new Promise((resolve, reject, onCancel) => {
    previewLoop(client.preview, counter.next, counter.frameDuration, onCancel);
    resolve();
  });
};




// save takes blob and filename
const capture = startCapture(config, client, save)
capture.then(() => {
  // send cli exit signal
})
// on stop button pressed
// capture.cancel();





const preview = startPreview(config, client)
preview.then(() => {
  // show stop button
  // preview.cancel();
})














// STANDALONE

// iframe
client = PostingClient(funcs);

// page
client = RecievingClient(url);


// CLI

// iframe
client = PostingClient(funcs);

// page
client = RecievingClient(url);


// SHADERTOY

// extension

client = Client(funcs);
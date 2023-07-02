(function () {
  let receiverId;
  const socket = io();

  function genarateId() {
    return `${Math.trunc(Math.random() * 999)}-${Math.trunc(
      Math.random() * 999,
    )}-${Math.trunc(Math.random() * 999)}`;
  }

  document
    .querySelector('#sender-start-con-btn')
    .addEventListener('click', function (e) {
      let joinId = genarateId();

      document.querySelector('#join-id').innerHTML = `
            <b>Room Id</b>
            <span>${joinId}</span>
        `;

      socket.emit('sender-join', {
        uid: joinId,
      });
    });

  socket.on('init', function (uid) {
    receiverId = uid;
    document.querySelector('.join-screen').classList.remove('active');
    document.querySelector('.fs-screen').classList.add('active');
  });

  document
    .querySelector('#file-input')
    .addEventListener('change', function (e) {
      let file = e.target.files[0];

      if (!file) {
        return;
      }

      let reader = new FileReader();
      reader.onload = function (e) {
        let buffer = new Uint8Array(reader.result);
        let el = document.createElement('div');
        el.classList.add('item');
        el.innerHTML = `
            <div class="progress">0%</div>
            <div class="filename">${file.name}</div>
        `;
        document.querySelector('.files-list').appendChild(el);
        shareFile(
          {
            filename: file.name,
            total_buffer_size: buffer.length,
            buffer_size: 1024,
          },
          buffer,
          el.querySelector('.progress'),
        );
      };
      reader.readAsArrayBuffer(file);
    });

  function shareFile(metaData, buffer, progress_node) {
    socket.emit('file-meta', {
      uid: receiverId,
      metadata: metaData,
    });

    socket.on('fs-share', function () {
      let chunk = buffer.slice(0, metaData.buffer_size);
      buffer = buffer.slice(metaData.buffer_size, buffer.length);
      progress_node.innerText =
        Math.trunc(
          ((metaData.total_buffer_size - buffer.length) /
            metaData.total_buffer_size) *
            100,
        ) + '%';

      if (chunk.length != 0) {
        socket.emit('file-raw', {
          uid: receiverId,
          buffer: chunk,
        });
      }
    });
  }
})();

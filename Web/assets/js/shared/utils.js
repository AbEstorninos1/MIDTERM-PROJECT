function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function formatPeso(value) {
  return '₱' + Number(value || 0).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}


function connectRealtime(onMessage, onStatus = () => {}) {
  const url = window.REALTIME_URL ||
    `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.hostname}:3000`;

  let delay = 1000;

  function open() {
    let socket;

    onStatus('connecting');

    try {
      socket = new WebSocket(url);
    } catch (error) {
      onStatus('offline');
      return;
    }

    socket.onopen = () => {
      delay = 1000;
      onStatus('online');
    };

    socket.onmessage = event => {
      try {
        onMessage(JSON.parse(event.data));
      } catch (error) {
        console.error(error);
      }
    };

    socket.onclose = () => {
      onStatus('offline');
      setTimeout(open, delay);
      delay = Math.min(delay * 2, 15000);
    };
  }

  open();
}

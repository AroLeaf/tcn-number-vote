module.exports = {
  send(url, msg) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
    });
  },

  edit(url, id, msg) {
    return fetch(`${url}/messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
    });
  }
}
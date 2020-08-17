const post = async (endpoint, payload) => {
    const url = new URL(endpoint);
    const { host } = url;
    const path = url.pathname
  
    const opts = {
      host,
      path,
      uri: url.href,
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  
    const res = await fetch(url.href, opts);
    const { status } = res;
    const json = await res.json();
    json.status = status;
  
    return json;
  };
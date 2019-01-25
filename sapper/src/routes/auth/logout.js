
export function get(req, res) {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Set-Cookie': `token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    })
    res.end(JSON.stringify({
      ok: true
    }))
}


```json
{
  "request": {
    "method": "POST",
    "urlPathPattern": "/api/sftp/send/([^/]+)/([^/]+)"
  },
  "response": {
    "status": 200,
    "transformers": ["sftp-send-transformer"]
  }
}


{
  "request": {
    "method": "GET",
    "urlPathPattern": "/api/sftp/check/([^/]+)/([^/]+)"
  },
  "response": {
    "status": 200,
    "transformers": ["sftp-check-transformer"]
  }
}



```

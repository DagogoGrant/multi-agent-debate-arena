import urllib.request
import json
headers = {
    "Authorization": "Bearer fake",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}
req = urllib.request.Request("https://opencode.ai/zen/go/v1/models", headers=headers)
with urllib.request.urlopen(req, timeout=10) as response:
    print(response.read().decode('utf-8'))

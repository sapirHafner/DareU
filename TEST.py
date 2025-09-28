import requests

API_URL = "https://api-inference.huggingface.co/models/unsloth/Meta-Llama-3.1-8B-Instruct"
headers = {"Authorization": "Bearer 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"}

data = {
    "inputs": "Hello!"
}

response = requests.post(API_URL, headers=headers, json=data)
print(response.status_code)
print(response.text)

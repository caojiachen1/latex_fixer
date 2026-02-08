use std::collections::HashMap;

#[tauri::command]
pub async fn proxy_llm_request(
    url: String,
    method: Option<String>,
    body: Option<String>,
    headers: Option<HashMap<String, String>>,
) -> Result<String, String> {
    let client = reqwest::Client::new();

    let method_str = method.unwrap_or_else(|| "POST".to_string());
    let mut req = match method_str.to_uppercase().as_str() {
        "GET" => client.get(&url),
        "POST" => client.post(&url),
        _ => client.post(&url),
    };

    if let Some(h) = headers {
        for (key, value) in h {
            req = req.header(&key, &value);
        }
    }

    if let Some(b) = body {
        req = req.header("Content-Type", "application/json");
        req = req.body(b);
    }

    let resp = req.send().await.map_err(|e| format!("Request failed: {}", e))?;
    let status = resp.status();
    let text = resp
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;

    if !status.is_success() {
        return Err(format!("HTTP {}: {}", status.as_u16(), text));
    }

    Ok(text)
}

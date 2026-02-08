use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Serialize, Deserialize)]
pub struct FileContent {
    pub path: String,
    pub content: String,
}

#[tauri::command]
pub async fn read_markdown_file(path: String) -> Result<FileContent, String> {
    let content =
        fs::read_to_string(&path).map_err(|e| format!("Failed to read file: {}", e))?;
    Ok(FileContent { path, content })
}

#[tauri::command]
pub async fn write_markdown_file(path: String, content: String) -> Result<(), String> {
    fs::write(&path, &content).map_err(|e| format!("Failed to write file: {}", e))?;
    Ok(())
}

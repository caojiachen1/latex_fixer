mod commands;

use commands::{file_ops, llm_proxy};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            file_ops::read_markdown_file,
            file_ops::write_markdown_file,
            llm_proxy::proxy_llm_request,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

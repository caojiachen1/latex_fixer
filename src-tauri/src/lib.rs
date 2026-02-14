mod commands;

use commands::{file_ops, llm_proxy};
use tauri::Manager;
use tauri::Emitter;
use window_vibrancy::apply_mica;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();

            #[cfg(target_os = "windows")]
            {
                let _ = apply_mica(&window, None);
                let _ = window.set_shadow(true);
                
                // For Windows 11 Snap Layouts to work with custom title bars,
                // the maximize button must have the specific ID "maximize-button".
                // We also ensure the window is ready for the effect.
            }
            
            // If the app was launched by dragging a file onto the exe, Windows
            // passes the file path(s) as command-line arguments. Forward any
            // path arguments to the frontend so the UI can open them.
            // We skip argv[0] which is the executable path.
            for arg in std::env::args().skip(1) {
                // emit an "open-file" event with the path string payload
                let _ = window.emit("open-file", arg.clone());
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            file_ops::read_markdown_file,
            file_ops::write_markdown_file,
            file_ops::get_startup_args,
            llm_proxy::proxy_llm_request,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

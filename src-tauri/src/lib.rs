mod commands;

use commands::{file_ops, latex_parser, llm_proxy};
use tauri::Manager;
use tauri::Emitter;
use window_vibrancy::apply_mica;

#[cfg(target_os = "windows")]
use windows::Win32::UI::WindowsAndMessaging::*;
#[cfg(target_os = "windows")]
use windows::Win32::Foundation::HWND;

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
                
                unsafe {
                    let hwnd = HWND(window.hwnd().unwrap().0 as *mut std::ffi::c_void);
                    let style = GetWindowLongW(hwnd, GWL_STYLE);
                    SetWindowLongW(hwnd, GWL_STYLE, style & !(WS_THICKFRAME.0 as i32));
                }
            }
            
            for arg in std::env::args().skip(1) {
                let _ = window.emit("open-file", arg.clone());
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            file_ops::read_markdown_file,
            file_ops::write_markdown_file,
            file_ops::get_startup_args,
            latex_parser::extract_formulas,
            llm_proxy::proxy_llm_request,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

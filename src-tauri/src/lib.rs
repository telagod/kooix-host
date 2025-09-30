// 模块声明
mod commands;
mod config;
mod fetcher;
mod hosts;

use commands::AppState;
use std::sync::Mutex;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 加载配置
    let app_config = config::load_config().unwrap_or_default();

    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .manage(AppState {
            config: Mutex::new(app_config),
        })
        .invoke_handler(tauri::generate_handler![
            commands::read_hosts_file,
            commands::get_config,
            commands::save_config,
            commands::update_hosts,
            commands::backup_hosts_file,
            commands::test_source,
            commands::test_connectivity,
            commands::test_multiple_connectivity,
            commands::test_hosts_connectivity,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// commands.rs - Tauri 命令接口
use crate::{config, fetcher, hosts};
use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

/// 应用状态
pub struct AppState {
    pub config: Mutex<config::AppConfig>,
}

/// API 响应结构
#[derive(Debug, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T> ApiResponse<T> {
    pub fn ok(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
        }
    }

    pub fn err(error: String) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(error),
        }
    }
}

/// 读取 hosts 文件
#[tauri::command]
pub fn read_hosts_file() -> ApiResponse<String> {
    match hosts::read_hosts() {
        Ok(content) => ApiResponse::ok(content),
        Err(e) => ApiResponse::err(e.to_string()),
    }
}

/// 获取配置
#[tauri::command]
pub fn get_config(state: State<AppState>) -> ApiResponse<config::AppConfig> {
    let config = state.config.lock().unwrap();
    ApiResponse::ok(config.clone())
}

/// 保存配置
#[tauri::command]
pub fn save_config(new_config: config::AppConfig, state: State<AppState>) -> ApiResponse<()> {
    match config::save_config(&new_config) {
        Ok(_) => {
            let mut config = state.config.lock().unwrap();
            *config = new_config;
            ApiResponse::ok(())
        }
        Err(e) => ApiResponse::err(e.to_string()),
    }
}

/// 从订阅源更新 hosts
#[tauri::command]
pub async fn update_hosts(state: State<'_, AppState>) -> Result<ApiResponse<String>, String> {
    let sources = {
        let config = state.config.lock().unwrap();
        config.sources.clone()
    };

    // 聚合所有启用的订阅源
    let aggregated_content = match fetcher::aggregate_hosts(&sources).await {
        Ok(content) => content,
        Err(e) => return Ok(ApiResponse::err(e.to_string())),
    };

    // 读取当前 hosts
    let current_hosts = match hosts::read_hosts() {
        Ok(content) => content,
        Err(e) => return Ok(ApiResponse::err(e.to_string())),
    };

    // 解析并合并
    let (custom_part, _) = hosts::parse_hosts(&current_hosts);
    let new_hosts = hosts::merge_hosts(&custom_part, &aggregated_content);

    // 备份
    if let Err(e) = hosts::backup_hosts() {
        log::warn!("备份 hosts 文件失败: {}", e);
    }

    // 写入新的 hosts
    match hosts::write_hosts(&new_hosts) {
        Ok(_) => {
            // 更新最后更新时间
            let mut config = state.config.lock().unwrap();
            config.last_update = Some(chrono::Local::now().to_rfc3339());
            let _ = config::save_config(&config);

            Ok(ApiResponse::ok("更新成功".to_string()))
        }
        Err(e) => Ok(ApiResponse::err(e.to_string())),
    }
}

/// 备份 hosts
#[tauri::command]
pub fn backup_hosts_file() -> ApiResponse<String> {
    match hosts::backup_hosts() {
        Ok(backup_path) => ApiResponse::ok(format!("备份成功: {:?}", backup_path)),
        Err(e) => ApiResponse::err(e.to_string()),
    }
}

/// 测试订阅源
#[tauri::command]
pub async fn test_source(url: String) -> Result<ApiResponse<String>, String> {
    match fetcher::fetch_hosts_from_url(&url).await {
        Ok(content) => Ok(ApiResponse::ok(content)),
        Err(e) => Ok(ApiResponse::err(e.to_string())),
    }
}

// config.rs - 配置管理模块
use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

use crate::fetcher::HostSource;

/// 应用配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub sources: Vec<HostSource>,
    pub auto_update: bool,
    pub update_interval_hours: u64,
    pub last_update: Option<String>,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            sources: crate::fetcher::get_default_sources(),
            auto_update: false,
            update_interval_hours: 24,
            last_update: None,
        }
    }
}

/// 获取配置文件路径
pub fn get_config_path() -> Result<PathBuf> {
    let config_dir = dirs::config_dir()
        .context("无法获取配置目录")?
        .join("kooix-host");

    if !config_dir.exists() {
        fs::create_dir_all(&config_dir)?;
    }

    Ok(config_dir.join("config.json"))
}

/// 加载配置
pub fn load_config() -> Result<AppConfig> {
    let config_path = get_config_path()?;

    if !config_path.exists() {
        let default_config = AppConfig::default();
        save_config(&default_config)?;
        return Ok(default_config);
    }

    let content = fs::read_to_string(&config_path)?;
    let config: AppConfig = serde_json::from_str(&content)?;

    Ok(config)
}

/// 保存配置
pub fn save_config(config: &AppConfig) -> Result<()> {
    let config_path = get_config_path()?;
    let content = serde_json::to_string_pretty(config)?;
    fs::write(&config_path, content)?;

    Ok(())
}

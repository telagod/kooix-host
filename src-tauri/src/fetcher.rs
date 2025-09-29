// fetcher.rs - 多源数据获取模块
use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};

/// 订阅源配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HostSource {
    pub name: String,
    pub url: String,
    pub enabled: bool,
}

impl Default for HostSource {
    fn default() -> Self {
        Self {
            name: "GitHub520".to_string(),
            url: "https://raw.hellogithub.com/hosts".to_string(),
            enabled: true,
        }
    }
}

/// 内置的默认订阅源
pub fn get_default_sources() -> Vec<HostSource> {
    vec![
        HostSource {
            name: "GitHub520".to_string(),
            url: "https://raw.hellogithub.com/hosts".to_string(),
            enabled: true,
        },
        HostSource {
            name: "GitHub Hosts (备用)".to_string(),
            url: "https://hosts.gitcdn.top/hosts.txt".to_string(),
            enabled: false,
        },
    ]
}

/// 从 URL 获取 hosts 内容
pub async fn fetch_hosts_from_url(url: &str) -> Result<String> {
    let response = reqwest::get(url)
        .await
        .with_context(|| format!("无法访问订阅源: {}", url))?;

    let content = response
        .text()
        .await
        .with_context(|| format!("无法读取订阅源内容: {}", url))?;

    Ok(content)
}

/// 从多个源聚合 hosts 内容
pub async fn aggregate_hosts(sources: &[HostSource]) -> Result<String> {
    let mut aggregated_content = String::new();

    for source in sources.iter().filter(|s| s.enabled) {
        match fetch_hosts_from_url(&source.url).await {
            Ok(content) => {
                aggregated_content.push_str(&format!("\n# === {} ===\n", source.name));
                aggregated_content.push_str(&content);
                aggregated_content.push('\n');
            }
            Err(e) => {
                log::warn!("获取订阅源 {} 失败: {}", source.name, e);
            }
        }
    }

    Ok(aggregated_content)
}
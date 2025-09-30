// fetcher.rs - 多源数据获取模块
use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::time::Duration;

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

/// 连通性测试结果
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectivityTestResult {
    pub domain: String,
    pub success: bool,
    pub status_code: Option<u16>,
    pub response_time_ms: Option<u64>,
    pub error: Option<String>,
}

/// 内置的默认订阅源
pub fn get_default_sources() -> Vec<HostSource> {
    vec![
        // GitHub 加速源
        HostSource {
            name: "GitHub520 (HelloGitHub)".to_string(),
            url: "https://raw.hellogithub.com/hosts".to_string(),
            enabled: true,
        },
        HostSource {
            name: "GitHub Hosts (GitCDN)".to_string(),
            url: "https://hosts.gitcdn.top/hosts.txt".to_string(),
            enabled: false,
        },
        HostSource {
            name: "GitHub Fast Access".to_string(),
            url: "https://raw.githubusercontent.com/namegenliang/fast-github-access/main/hosts.txt"
                .to_string(),
            enabled: false,
        },
        // Steam 游戏平台加速
        HostSource {
            name: "Steam 社区加速 (完整)".to_string(),
            url: "https://raw.githubusercontent.com/Clov614/SteamHostSync/main/Hosts".to_string(),
            enabled: false,
        },
        HostSource {
            name: "Steam 社区加速 (Steam only)".to_string(),
            url: "https://raw.githubusercontent.com/Clov614/SteamHostSync/main/Hosts_steam"
                .to_string(),
            enabled: false,
        },
        // Docker Registry 加速
        HostSource {
            name: "Docker Registry 加速".to_string(),
            url: "https://raw.githubusercontent.com/Clov614/SteamHostSync/main/Hosts".to_string(),
            enabled: false,
        },
        // 综合加速源
        HostSource {
            name: "Google & Microsoft 服务".to_string(),
            url: "https://raw.githubusercontent.com/laucyun/hosts/master/hosts".to_string(),
            enabled: false,
        },
        // 镜像备用源 (使用 CDN 加速)
        HostSource {
            name: "GitHub520 (镜像加速)".to_string(),
            url: "https://raw.sevencdn.com/521xueweihan/GitHub520/main/hosts".to_string(),
            enabled: false,
        },
        HostSource {
            name: "Steam 社区 (镜像加速)".to_string(),
            url: "https://raw.sevencdn.com/Clov614/SteamHostSync/main/Hosts_steam".to_string(),
            enabled: false,
        },
    ]
}

/// 从 URL 获取 hosts 内容
pub async fn fetch_hosts_from_url(url: &str) -> Result<String> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(30))
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .build()?;

    let response = client
        .get(url)
        .send()
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

/// 测试域名连通性
pub async fn test_domain_connectivity(domain: &str) -> ConnectivityTestResult {
    let url = if domain.starts_with("http") {
        domain.to_string()
    } else {
        format!("https://{}", domain)
    };

    let start = std::time::Instant::now();

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(10))
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .danger_accept_invalid_certs(true) // 忽略证书错误，只测试连通性
        .build();

    match client {
        Ok(client) => {
            match client.get(&url).send().await {
                Ok(response) => {
                    let elapsed = start.elapsed().as_millis() as u64;
                    let status = response.status().as_u16();

                    ConnectivityTestResult {
                        domain: domain.to_string(),
                        success: status < 500, // 4xx 也算成功（说明能连上）
                        status_code: Some(status),
                        response_time_ms: Some(elapsed),
                        error: None,
                    }
                }
                Err(e) => {
                    let elapsed = start.elapsed().as_millis() as u64;
                    ConnectivityTestResult {
                        domain: domain.to_string(),
                        success: false,
                        status_code: None,
                        response_time_ms: Some(elapsed),
                        error: Some(e.to_string()),
                    }
                }
            }
        }
        Err(e) => ConnectivityTestResult {
            domain: domain.to_string(),
            success: false,
            status_code: None,
            response_time_ms: None,
            error: Some(e.to_string()),
        },
    }
}

/// 批量测试多个域名
pub async fn test_multiple_domains(domains: Vec<String>) -> Vec<ConnectivityTestResult> {
    let mut results = Vec::new();

    for domain in domains {
        let result = test_domain_connectivity(&domain).await;
        results.push(result);
    }

    results
}

/// 从 hosts 内容中提取常见域名用于测试
pub fn extract_test_domains(hosts_content: &str) -> Vec<String> {
    let mut domains = Vec::new();

    // 预定义的关键域名用于测试
    let key_domains = vec![
        "github.com",
        "api.github.com",
        "raw.githubusercontent.com",
        "steamcommunity.com",
        "store.steampowered.com",
    ];

    for domain in key_domains {
        if hosts_content.contains(domain) {
            domains.push(domain.to_string());
        }
    }

    domains
}

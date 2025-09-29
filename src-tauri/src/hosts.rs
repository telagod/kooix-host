// hosts.rs - Hosts 文件操作模块
use anyhow::{Context, Result};
use std::fs;
use std::path::PathBuf;
use std::process::Command;

/// 获取系统 hosts 文件路径
pub fn get_hosts_path() -> PathBuf {
    #[cfg(target_os = "windows")]
    {
        PathBuf::from(r"C:\Windows\System32\drivers\etc\hosts")
    }

    #[cfg(any(target_os = "macos", target_os = "linux"))]
    {
        PathBuf::from("/etc/hosts")
    }
}

/// 读取 hosts 文件内容
pub fn read_hosts() -> Result<String> {
    let hosts_path = get_hosts_path();
    fs::read_to_string(&hosts_path)
        .with_context(|| format!("无法读取 hosts 文件: {:?}", hosts_path))
}

/// 写入 hosts 文件内容
pub fn write_hosts(content: &str) -> Result<()> {
    let hosts_path = get_hosts_path();

    // 先尝试直接写入
    match fs::write(&hosts_path, content) {
        Ok(_) => return Ok(()),
        Err(e) => {
            log::warn!("直接写入失败: {}, 尝试使用 sudo 提权", e);

            // Linux/macOS: 使用 pkexec 或 sudo
            #[cfg(any(target_os = "linux", target_os = "macos"))]
            {
                write_hosts_with_sudo(content, &hosts_path)?;
                return Ok(());
            }

            // Windows: 需要管理员权限
            #[cfg(target_os = "windows")]
            {
                return Err(anyhow::anyhow!(
                    "无法写入 hosts 文件，请以管理员身份运行程序"
                ));
            }
        }
    }
}

/// Linux/macOS 使用 sudo 写入 hosts 文件
#[cfg(any(target_os = "linux", target_os = "macos"))]
fn write_hosts_with_sudo(content: &str, hosts_path: &PathBuf) -> Result<()> {
    // 将内容写入临时文件
    let temp_dir = std::env::temp_dir();
    let temp_file = temp_dir.join(format!("kooix_hosts_{}", chrono::Local::now().timestamp()));
    fs::write(&temp_file, content)
        .with_context(|| format!("无法写入临时文件: {:?}", temp_file))?;

    log::info!("使用 pkexec 提权写入 hosts 文件");

    // 优先尝试 pkexec (图形界面提权)
    let output = Command::new("pkexec")
        .arg("cp")
        .arg(&temp_file)
        .arg(&hosts_path)
        .output();

    match output {
        Ok(out) if out.status.success() => {
            log::info!("pkexec 提权成功");
            let _ = fs::remove_file(&temp_file);
            return Ok(());
        }
        Ok(out) => {
            log::warn!("pkexec 失败: {:?}", String::from_utf8_lossy(&out.stderr));
        }
        Err(e) => {
            log::warn!("pkexec 不可用: {}", e);
        }
    }

    // 备用方案：尝试 sudo (需要终端)
    log::info!("尝试使用 sudo 提权");
    let output = Command::new("sudo")
        .arg("-S") // 从 stdin 读取密码
        .arg("cp")
        .arg(&temp_file)
        .arg(&hosts_path)
        .output()
        .with_context(|| "无法执行 sudo 命令")?;

    // 清理临时文件
    let _ = fs::remove_file(&temp_file);

    if output.status.success() {
        log::info!("sudo 提权成功");
        Ok(())
    } else {
        Err(anyhow::anyhow!(
            "sudo 提权失败: {}",
            String::from_utf8_lossy(&output.stderr)
        ))
    }
}

/// 备份 hosts 文件
pub fn backup_hosts() -> Result<PathBuf> {
    let hosts_path = get_hosts_path();
    let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S");
    let backup_path = hosts_path.with_extension(format!("backup_{}", timestamp));

    fs::copy(&hosts_path, &backup_path)
        .with_context(|| format!("无法备份 hosts 文件到: {:?}", backup_path))?;

    Ok(backup_path)
}

/// 解析 hosts 内容，区分自定义部分和 Kooix 管理部分
pub fn parse_hosts(content: &str) -> (String, String) {
    const MARKER_START: &str = "# === Kooix Host Manager Start ===";
    const MARKER_END: &str = "# === Kooix Host Manager End ===";

    if let Some(start_pos) = content.find(MARKER_START) {
        if let Some(end_pos) = content[start_pos..].find(MARKER_END) {
            let custom_part = content[..start_pos].trim_end().to_string();
            let managed_start = start_pos;
            let managed_end = start_pos + end_pos + MARKER_END.len();
            let managed_part = content[managed_start..managed_end].to_string();

            return (custom_part, managed_part);
        }
    }

    // 没有 Kooix 标记，全部视为自定义内容
    (content.trim().to_string(), String::new())
}

/// 合并自定义内容和 Kooix 管理的内容
pub fn merge_hosts(custom_part: &str, managed_content: &str) -> String {
    const MARKER_START: &str = "# === Kooix Host Manager Start ===";
    const MARKER_END: &str = "# === Kooix Host Manager End ===";

    let mut result = custom_part.trim_end().to_string();
    result.push_str("\n\n");
    result.push_str(MARKER_START);
    result.push('\n');
    result.push_str(managed_content.trim());
    result.push('\n');
    result.push_str(MARKER_END);
    result.push('\n');

    result
}
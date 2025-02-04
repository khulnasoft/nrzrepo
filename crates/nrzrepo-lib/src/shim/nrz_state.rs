use const_format::formatcp;

/// Struct containing helper methods for querying information about the
/// currently running nrz binary.
#[derive(Debug)]
pub struct NrzState;

impl NrzState {
    pub const fn platform_name() -> &'static str {
        const ARCH: &str = {
            #[cfg(target_arch = "x86_64")]
            {
                "64"
            }
            #[cfg(target_arch = "aarch64")]
            {
                "arm64"
            }
            #[cfg(not(any(target_arch = "x86_64", target_arch = "aarch64")))]
            {
                "unknown"
            }
        };

        const OS: &str = {
            #[cfg(target_os = "macos")]
            {
                "darwin"
            }
            #[cfg(target_os = "windows")]
            {
                "windows"
            }
            #[cfg(target_os = "linux")]
            {
                "linux"
            }
            #[cfg(not(any(target_os = "macos", target_os = "windows", target_os = "linux")))]
            {
                "unknown"
            }
        };

        formatcp!("{}-{}", OS, ARCH)
    }

    pub const fn platform_package_name() -> &'static str {
        formatcp!("nrz-{}", NrzState::platform_name())
    }

    pub const fn binary_name() -> &'static str {
        {
            #[cfg(windows)]
            {
                "nrz.exe"
            }
            #[cfg(not(windows))]
            {
                "nrz"
            }
        }
    }

    pub fn version() -> &'static str {
        include_str!("../../../../version.txt")
            .lines()
            .next()
            .expect("Failed to read version from version.txt")
    }
}

use dirs_next::config_dir as dirs_config_dir;
use nrzpath::{AbsoluteSystemPathBuf, PathError};
use thiserror::Error;

/// Returns the path to the user's configuration directory.
///
/// This is a wrapper around `dirs_next::config_dir` that also checks the
/// `NRZ_CONFIG_DIR_PATH` environment variable. If the environment variable
/// is set, it will return that path instead of `dirs_next::config_dir`.
pub fn config_dir() -> Result<Option<AbsoluteSystemPathBuf>, PathError> {
    if let Ok(dir) = std::env::var("NRZ_CONFIG_DIR_PATH") {
        return AbsoluteSystemPathBuf::new(dir).map(Some);
    }

    dirs_config_dir()
        .map(AbsoluteSystemPathBuf::try_from)
        .transpose()
}

/// Returns the path to the user's configuration directory.
///
/// This is a wrapper around `dirs_next::config_dir` that also checks the
///  VERCEL_CONFIG_DIR_PATH` environment variable. If the environment variable
/// is set, it will return that path instead of `dirs_next::config_dir`.
pub fn vercel_config_dir() -> Result<Option<AbsoluteSystemPathBuf>, PathError> {
    if let Ok(dir) = std::env::var("VERCEL_CONFIG_DIR_PATH") {
        return AbsoluteSystemPathBuf::new(dir).map(Some);
    }

    dirs_config_dir()
        .map(AbsoluteSystemPathBuf::try_from)
        .transpose()
}

#[derive(Debug, Error)]
pub enum Error {
    #[error("Config directory not found.")]
    ConfigDirNotFound,
}

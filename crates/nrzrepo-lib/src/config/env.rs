use std::{
    collections::HashMap,
    ffi::{OsStr, OsString},
};

use clap::ValueEnum;
use itertools::Itertools;
use tracing::warn;
use nrzpath::AbsoluteSystemPathBuf;
use nrzrepo_cache::CacheConfig;

use super::{ConfigurationOptions, Error, ResolvedConfigurationOptions};
use crate::{
    cli::{EnvMode, LogOrder},
    nrz_json::UIMode,
};

const NRZ_MAPPING: &[(&str, &str)] = [
    ("nrz_api", "api_url"),
    ("nrz_login", "login_url"),
    ("nrz_team", "team_slug"),
    ("nrz_teamid", "team_id"),
    ("nrz_token", "token"),
    ("nrz_remote_cache_timeout", "timeout"),
    ("nrz_remote_cache_upload_timeout", "upload_timeout"),
    ("nrz_ui", "ui"),
    (
        "nrz_dangerously_disable_package_manager_check",
        "allow_no_package_manager",
    ),
    ("nrz_daemon", "daemon"),
    ("nrz_env_mode", "env_mode"),
    ("nrz_cache_dir", "cache_dir"),
    ("nrz_preflight", "preflight"),
    ("nrz_scm_base", "scm_base"),
    ("nrz_scm_head", "scm_head"),
    ("nrz_root_nrz_json", "root_nrz_json_path"),
    ("nrz_force", "force"),
    ("nrz_log_order", "log_order"),
    ("nrz_remote_only", "remote_only"),
    ("nrz_remote_cache_read_only", "remote_cache_read_only"),
    ("nrz_run_summary", "run_summary"),
    ("nrz_allow_no_nrz_json", "allow_no_nrz_json"),
    ("nrz_cache", "cache"),
]
.as_slice();

pub struct EnvVars {
    output_map: HashMap<&'static str, String>,
}

impl EnvVars {
    pub fn new(environment: &HashMap<OsString, OsString>) -> Result<Self, Error> {
        let nrz_mapping: HashMap<_, _> = NRZ_MAPPING.iter().copied().collect();
        let output_map = map_environment(nrz_mapping, environment)?;
        Ok(Self { output_map })
    }

    fn truthy_value(&self, key: &str) -> Option<Option<bool>> {
        Some(truth_env_var(
            self.output_map.get(key).filter(|s| !s.is_empty())?,
        ))
    }
}

impl ResolvedConfigurationOptions for EnvVars {
    fn get_configuration_options(
        &self,
        _existing_config: &ConfigurationOptions,
    ) -> Result<ConfigurationOptions, Error> {
        // Process signature
        let signature = self
            .truthy_value("signature")
            .map(|value| value.ok_or_else(|| Error::InvalidSignature))
            .transpose()?;

        // Process preflight
        let preflight = self
            .truthy_value("preflight")
            .map(|value| value.ok_or_else(|| Error::InvalidPreflight))
            .transpose()?;

        let force = self.truthy_value("force").flatten();
        let mut remote_only = self.truthy_value("remote_only").flatten();

        let mut remote_cache_read_only = self.truthy_value("remote_cache_read_only").flatten();

        let run_summary = self.truthy_value("run_summary").flatten();
        let allow_no_nrz_json = self.truthy_value("allow_no_nrz_json").flatten();
        let mut cache: Option<nrzrepo_cache::CacheConfig> = self
            .output_map
            .get("cache")
            .map(|c| c.parse())
            .transpose()?;

        if remote_only.is_some_and(|t| t) {
            if let Some(cache) = cache {
                // If NRZ_REMOTE_ONLY and NRZ_CACHE result in the same behavior, remove
                // REMOTE_ONLY to avoid deprecation warning or mixing of old/new
                // cache flag error.
                if cache == CacheConfig::remote_only() {
                    remote_only = None;
                }
            }
        }
        if remote_cache_read_only.is_some_and(|t| t) {
            if let Some(cache) = cache {
                // If NRZ_REMOTE_CACHE_READ_ONLY and NRZ_CACHE result in the same behavior,
                // remove REMOTE_CACHE_READ_ONLY to avoid deprecation warning or
                // mixing of old/new cache flag error.
                if cache == CacheConfig::remote_read_only() {
                    remote_cache_read_only = None;
                }
            }
        }

        // If NRZ_FORCE is set it wins out over NRZ_CACHE
        if force.is_some_and(|t| t) {
            cache = None;
        }

        if remote_only.is_some() {
            warn!(
                "NRZ_REMOTE_ONLY is deprecated and will be removed in a future major version. \
                 Use NRZ_CACHE=remote:rw"
            );
        }

        if remote_cache_read_only.is_some() {
            warn!(
                "NRZ_REMOTE_CACHE_READ_ONLY is deprecated and will be removed in a future major \
                 version. Use NRZ_CACHE=remote:r"
            );
        }

        // Process timeout
        let timeout = self
            .output_map
            .get("timeout")
            .map(|s| s.parse())
            .transpose()
            .map_err(Error::InvalidRemoteCacheTimeout)?;

        let upload_timeout = self
            .output_map
            .get("upload_timeout")
            .map(|s| s.parse())
            .transpose()
            .map_err(Error::InvalidUploadTimeout)?;

        // Process experimentalUI
        let ui =
            self.truthy_value("ui")
                .flatten()
                .map(|ui| if ui { UIMode::Tui } else { UIMode::Stream });

        let allow_no_package_manager = self.truthy_value("allow_no_package_manager").flatten();

        // Process daemon
        let daemon = self.truthy_value("daemon").flatten();

        let env_mode = self
            .output_map
            .get("env_mode")
            .map(|s| s.as_str())
            .and_then(|s| match s {
                "strict" => Some(EnvMode::Strict),
                "loose" => Some(EnvMode::Loose),
                _ => None,
            });

        let cache_dir = self.output_map.get("cache_dir").map(|s| s.clone().into());

        let root_nrz_json_path = self
            .output_map
            .get("root_nrz_json_path")
            .filter(|s| !s.is_empty())
            .map(AbsoluteSystemPathBuf::from_cwd)
            .transpose()?;

        let log_order = self
            .output_map
            .get("log_order")
            .filter(|s| !s.is_empty())
            .map(|s| LogOrder::from_str(s, true))
            .transpose()
            .map_err(|_| {
                Error::InvalidLogOrder(
                    LogOrder::value_variants()
                        .iter()
                        .map(|v| v.to_string())
                        .join(", "),
                )
            })?;

        // We currently don't pick up a Spaces ID via env var, we likely won't
        // continue using the Spaces name, we can add an env var when we have the
        // name we want to stick with.
        let spaces_id = None;

        let output = ConfigurationOptions {
            api_url: self.output_map.get("api_url").cloned(),
            login_url: self.output_map.get("login_url").cloned(),
            team_slug: self.output_map.get("team_slug").cloned(),
            team_id: self.output_map.get("team_id").cloned(),
            token: self.output_map.get("token").cloned(),
            scm_base: self.output_map.get("scm_base").cloned(),
            scm_head: self.output_map.get("scm_head").cloned(),
            cache,
            // Processed booleans
            signature,
            preflight,
            enabled: None,
            ui,
            allow_no_package_manager,
            daemon,
            force,
            remote_only,
            remote_cache_read_only,
            run_summary,
            allow_no_nrz_json,

            // Processed numbers
            timeout,
            upload_timeout,
            spaces_id,
            env_mode,
            cache_dir,
            root_nrz_json_path,
            log_order,
        };

        Ok(output)
    }
}

pub fn truth_env_var(s: &str) -> Option<bool> {
    match s {
        "true" | "1" => Some(true),
        "false" | "0" => Some(false),
        _ => None,
    }
}

fn map_environment<'a>(
    // keys are environment variable names
    // values are properties of ConfigurationOptions we want to store the
    // values in
    mapping: HashMap<&str, &'a str>,

    // keys are environment variable names
    // values are the values of those environment variables
    environment: &HashMap<OsString, OsString>,
) -> Result<HashMap<&'a str, String>, Error> {
    let mut output_map = HashMap::new();
    mapping
        .into_iter()
        .try_for_each(|(mapping_key, mapped_property)| -> Result<(), Error> {
            if let Some(value) = environment.get(OsStr::new(mapping_key)) {
                let converted = value
                    .to_str()
                    .ok_or_else(|| Error::Encoding(mapping_key.to_ascii_uppercase()))?;
                output_map.insert(mapped_property, converted.to_owned());
            }
            Ok(())
        })?;
    Ok(output_map)
}

#[cfg(test)]
mod test {
    use camino::Utf8PathBuf;

    use super::*;
    use crate::{
        cli::LogOrder,
        config::{DEFAULT_API_URL, DEFAULT_LOGIN_URL},
    };

    #[test]
    fn test_env_setting() {
        let mut env: HashMap<OsString, OsString> = HashMap::new();

        let nrz_api = "https://example.com/api";
        let nrz_login = "https://example.com/login";
        let nrz_team = "vercel";
        let nrz_teamid = "team_nLlpyC6REAqxydlFKbrMDlud";
        let nrz_token = "abcdef1234567890abcdef";
        let cache_dir = Utf8PathBuf::from("nebulo9");
        let nrz_remote_cache_timeout = 200;
        let root_nrz_json = if cfg!(windows) {
            "C:\\some\\dir\\yolo.json"
        } else {
            "/some/dir/yolo.json"
        };

        env.insert("nrz_api".into(), nrz_api.into());
        env.insert("nrz_login".into(), nrz_login.into());
        env.insert("nrz_team".into(), nrz_team.into());
        env.insert("nrz_teamid".into(), nrz_teamid.into());
        env.insert("nrz_token".into(), nrz_token.into());
        env.insert(
            "nrz_remote_cache_timeout".into(),
            nrz_remote_cache_timeout.to_string().into(),
        );
        env.insert("nrz_ui".into(), "true".into());
        env.insert(
            "nrz_dangerously_disable_package_manager_check".into(),
            "true".into(),
        );
        env.insert("nrz_daemon".into(), "true".into());
        env.insert("nrz_preflight".into(), "true".into());
        env.insert("nrz_env_mode".into(), "strict".into());
        env.insert("nrz_cache_dir".into(), cache_dir.clone().into());
        env.insert("nrz_root_nrz_json".into(), root_nrz_json.into());
        env.insert("nrz_force".into(), "1".into());
        env.insert("nrz_log_order".into(), "grouped".into());
        env.insert("nrz_remote_only".into(), "1".into());
        env.insert("nrz_remote_cache_read_only".into(), "1".into());
        env.insert("nrz_run_summary".into(), "true".into());
        env.insert("nrz_allow_no_nrz_json".into(), "true".into());
        env.insert("nrz_remote_cache_upload_timeout".into(), "200".into());

        let config = EnvVars::new(&env)
            .unwrap()
            .get_configuration_options(&ConfigurationOptions::default())
            .unwrap();
        assert!(config.preflight());
        assert!(config.force());
        assert_eq!(config.log_order(), LogOrder::Grouped);
        assert!(config.remote_only());
        assert!(config.remote_cache_read_only());
        assert!(config.run_summary());
        assert!(config.allow_no_nrz_json());
        assert_eq!(config.upload_timeout(), 200);
        assert_eq!(nrz_api, config.api_url.unwrap());
        assert_eq!(nrz_login, config.login_url.unwrap());
        assert_eq!(nrz_team, config.team_slug.unwrap());
        assert_eq!(nrz_teamid, config.team_id.unwrap());
        assert_eq!(nrz_token, config.token.unwrap());
        assert_eq!(nrz_remote_cache_timeout, config.timeout.unwrap());
        assert_eq!(Some(UIMode::Tui), config.ui);
        assert_eq!(Some(true), config.allow_no_package_manager);
        assert_eq!(Some(true), config.daemon);
        assert_eq!(Some(EnvMode::Strict), config.env_mode);
        assert_eq!(cache_dir, config.cache_dir.unwrap());
        assert_eq!(
            config.root_nrz_json_path,
            Some(AbsoluteSystemPathBuf::new(root_nrz_json).unwrap())
        );
    }

    #[test]
    fn test_empty_env_setting() {
        let mut env: HashMap<OsString, OsString> = HashMap::new();
        env.insert("nrz_api".into(), "".into());
        env.insert("nrz_login".into(), "".into());
        env.insert("nrz_team".into(), "".into());
        env.insert("nrz_teamid".into(), "".into());
        env.insert("nrz_token".into(), "".into());
        env.insert("nrz_ui".into(), "".into());
        env.insert("nrz_daemon".into(), "".into());
        env.insert("nrz_env_mode".into(), "".into());
        env.insert("nrz_preflight".into(), "".into());
        env.insert("nrz_scm_head".into(), "".into());
        env.insert("nrz_scm_base".into(), "".into());
        env.insert("nrz_root_nrz_json".into(), "".into());
        env.insert("nrz_force".into(), "".into());
        env.insert("nrz_log_order".into(), "".into());
        env.insert("nrz_remote_only".into(), "".into());
        env.insert("nrz_remote_cache_read_only".into(), "".into());
        env.insert("nrz_run_summary".into(), "".into());
        env.insert("nrz_allow_no_nrz_json".into(), "".into());

        let config = EnvVars::new(&env)
            .unwrap()
            .get_configuration_options(&ConfigurationOptions::default())
            .unwrap();
        assert_eq!(config.api_url(), DEFAULT_API_URL);
        assert_eq!(config.login_url(), DEFAULT_LOGIN_URL);
        assert_eq!(config.team_slug(), None);
        assert_eq!(config.team_id(), None);
        assert_eq!(config.token(), None);
        assert_eq!(config.ui, None);
        assert_eq!(config.daemon, None);
        assert_eq!(config.env_mode, None);
        assert!(!config.preflight());
        assert_eq!(config.scm_base(), None);
        assert_eq!(config.scm_head(), None);
        assert_eq!(config.root_nrz_json_path, None);
        assert!(!config.force());
        assert_eq!(config.log_order(), LogOrder::Auto);
        assert!(!config.remote_only());
        assert!(!config.remote_cache_read_only());
        assert!(!config.run_summary());
        assert!(!config.allow_no_nrz_json());
    }
}

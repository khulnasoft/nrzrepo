mod local_nrz_config;
mod local_nrz_state;
mod parser;
mod nrz_state;

use std::{backtrace::Backtrace, env, process, process::Stdio, time::Duration};

use dunce::canonicalize as fs_canonicalize;
use local_nrz_config::LocalNrzConfig;
use local_nrz_state::{nrz_version_has_shim, LocalNrzState};
use miette::{Diagnostic, SourceSpan};
use parser::{MultipleCwd, ShimArgs};
use thiserror::Error;
use tiny_gradient::{GradientStr, RGB};
use tracing::{debug, warn};
pub use nrz_state::NrzState;
use nrz_updater::display_update_check;
use nrzpath::AbsoluteSystemPathBuf;
use nrzrepo_repository::inference::{RepoMode, RepoState};
use nrzrepo_ui::ColorConfig;
use which::which;

use crate::{cli, get_version, spawn_child, tracing::NrzSubscriber};

const NRZ_GLOBAL_WARNING_DISABLED: &str = "NRZ_GLOBAL_WARNING_DISABLED";

#[derive(Debug, Error, Diagnostic)]
pub enum Error {
    #[error(transparent)]
    #[diagnostic(transparent)]
    MultipleCwd(Box<MultipleCwd>),
    #[error("No value assigned to `--cwd` flag.")]
    #[diagnostic(code(nrz::shim::empty_cwd))]
    EmptyCwd {
        #[backtrace]
        backtrace: Backtrace,
        #[source_code]
        args_string: String,
        #[label = "Requires a path to be passed after it"]
        flag_range: SourceSpan,
    },
    #[error(transparent)]
    #[diagnostic(transparent)]
    Cli(#[from] cli::Error),
    #[error(transparent)]
    Inference(#[from] nrzrepo_repository::inference::Error),
    #[error("Failed to execute local `nrz` process.")]
    LocalNrzProcess(#[source] std::io::Error),
    #[error("Failed to resolve local `nrz` path: {0}")]
    LocalNrzPath(String),
    #[error("Failed to find `npx`: {0}")]
    Which(#[from] which::Error),
    #[error("Failed to execute `nrz` via `npx`.")]
    NpxNrzProcess(#[source] std::io::Error),
    #[error("Failed to resolve repository root: {0}")]
    RepoRootPath(AbsoluteSystemPathBuf),
    #[error(transparent)]
    Path(#[from] nrzpath::PathError),
}

/// Attempts to run correct nrz by finding nearest package.json,
/// then finding local nrz installation. If the current binary is the
/// local nrz installation, then we run current nrz. Otherwise we
/// kick over to the local nrz installation.
///
/// # Arguments
///
/// * `nrz_state`: state for current execution
///
/// returns: Result<i32, Error>
fn run_correct_nrz(
    repo_state: RepoState,
    shim_args: ShimArgs,
    subscriber: &NrzSubscriber,
    ui: ColorConfig,
) -> Result<i32, Error> {
    if let Some(nrz_state) = LocalNrzState::infer(&repo_state.root) {
        try_check_for_updates(&shim_args, nrz_state.version());

        if nrz_state.local_is_self() {
            env::set_var(
                cli::INVOCATION_DIR_ENV_VAR,
                shim_args.invocation_dir.as_path(),
            );
            debug!("Currently running nrz is local nrz.");
            Ok(cli::run(Some(repo_state), subscriber, ui)?)
        } else {
            spawn_local_nrz(&repo_state, nrz_state, shim_args)
        }
    } else if let Some(local_config) = LocalNrzConfig::infer(&repo_state) {
        debug!(
            "Found configuration for nrz version {}",
            local_config.nrz_version()
        );
        spawn_npx_nrz(&repo_state, local_config.nrz_version(), shim_args)
    } else {
        let version = get_version();
        try_check_for_updates(&shim_args, version);
        // cli::run checks for this env var, rather than an arg, so that we can support
        // calling old versions without passing unknown flags.
        env::set_var(
            cli::INVOCATION_DIR_ENV_VAR,
            shim_args.invocation_dir.as_path(),
        );
        debug!("Running command as global nrz");
        let should_warn_on_global = env::var(NRZ_GLOBAL_WARNING_DISABLED)
            .map_or(true, |disable| !matches!(disable.as_str(), "1" | "true"));
        if should_warn_on_global {
            warn!("No locally installed `nrz` found. Using version: {version}.");
        }
        Ok(cli::run(Some(repo_state), subscriber, ui)?)
    }
}

fn spawn_local_nrz(
    repo_state: &RepoState,
    local_nrz_state: LocalNrzState,
    mut shim_args: ShimArgs,
) -> Result<i32, Error> {
    let local_nrz_path = fs_canonicalize(local_nrz_state.binary()).map_err(|_| {
        Error::LocalNrzPath(local_nrz_state.binary().to_string_lossy().to_string())
    })?;
    debug!(
        "Running local nrz binary in {}\n",
        local_nrz_path.display()
    );
    let cwd = fs_canonicalize(&repo_state.root)
        .map_err(|_| Error::RepoRootPath(repo_state.root.clone()))?;

    let raw_args = modify_args_for_local(&mut shim_args, repo_state, local_nrz_state.version());

    // We spawn a process that executes the local nrz
    // that we've found in node_modules/.bin/nrz.
    let mut command = process::Command::new(local_nrz_path);
    command
        .args(&raw_args)
        // rather than passing an argument that local nrz might not understand, set
        // an environment variable that can be optionally used
        .env(
            cli::INVOCATION_DIR_ENV_VAR,
            shim_args.invocation_dir.as_path(),
        )
        .current_dir(cwd)
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit());

    spawn_child_nrz(command, Error::LocalNrzProcess)
}

fn spawn_npx_nrz(
    repo_state: &RepoState,
    nrz_version: &str,
    mut shim_args: ShimArgs,
) -> Result<i32, Error> {
    debug!("Running nrz@{nrz_version} via npx");
    let npx_path = which("npx")?;
    let cwd = fs_canonicalize(&repo_state.root)
        .map_err(|_| Error::RepoRootPath(repo_state.root.clone()))?;

    let raw_args = modify_args_for_local(&mut shim_args, repo_state, nrz_version);

    let mut command = process::Command::new(npx_path);
    command.arg("-y");
    command.arg(format!("nrz@{nrz_version}"));

    // rather than passing an argument that local nrz might not understand, set
    // an environment variable that can be optionally used
    command
        .args(&raw_args)
        .env(
            cli::INVOCATION_DIR_ENV_VAR,
            shim_args.invocation_dir.as_path(),
        )
        .current_dir(cwd)
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit());

    spawn_child_nrz(command, Error::NpxNrzProcess)
}

fn modify_args_for_local(
    shim_args: &mut ShimArgs,
    repo_state: &RepoState,
    local_version: &str,
) -> Vec<String> {
    let supports_skip_infer_and_single_package = nrz_version_has_shim(local_version);
    let already_has_single_package_flag = shim_args
        .remaining_nrz_args
        .contains(&"--single-package".to_string());
    let should_add_single_package_flag = repo_state.mode == RepoMode::SinglePackage
        && !already_has_single_package_flag
        && supports_skip_infer_and_single_package;

    debug!(
        "supports_skip_infer_and_single_package {:?}",
        supports_skip_infer_and_single_package
    );

    let mut raw_args: Vec<_> = if supports_skip_infer_and_single_package {
        vec!["--skip-infer".to_string()]
    } else {
        Vec::new()
    };

    raw_args.append(&mut shim_args.remaining_nrz_args);

    // We add this flag after the raw args to avoid accidentally passing it
    // as a global flag instead of as a run flag.
    if should_add_single_package_flag {
        raw_args.push("--single-package".to_string());
    }

    raw_args.push("--".to_string());
    raw_args.append(&mut shim_args.forwarded_args);

    raw_args
}

fn spawn_child_nrz(
    command: process::Command,
    err: fn(std::io::Error) -> Error,
) -> Result<i32, Error> {
    let child = spawn_child(command).map_err(err)?;

    let exit_status = child.wait().map_err(err)?;
    let exit_code = exit_status.code().unwrap_or_else(|| {
        debug!("child nrz failed to report exit code");
        #[cfg(unix)]
        {
            use std::os::unix::process::ExitStatusExt;
            let signal = exit_status.signal();
            let core_dumped = exit_status.core_dumped();
            debug!(
                "child nrz caught signal {:?}. Core dumped? {}",
                signal, core_dumped
            );
        }
        2
    });

    Ok(exit_code)
}

/// Checks for `NRZ_BINARY_PATH` variable. If it is set,
/// we do not try to find local nrz, we simply run the command as
/// the current binary. This is due to legacy behavior of `NRZ_BINARY_PATH`
/// that lets users dynamically set the path of the nrz binary. Because
/// that conflicts with finding a local nrz installation and
/// executing that binary, these two features are fundamentally incompatible.
fn is_nrz_binary_path_set() -> bool {
    env::var("NRZ_BINARY_PATH").is_ok()
}

fn try_check_for_updates(args: &ShimArgs, current_version: &str) {
    if args.should_check_for_update() {
        // custom footer for update message
        let footer = format!(
            "Follow {username} for updates: {url}",
            username = "@nrzrepo".gradient([RGB::new(0, 153, 247), RGB::new(241, 23, 18)]),
            url = "https://x.com/nrzrepo"
        );

        let interval = if args.force_update_check {
            // force update check
            Some(Duration::ZERO)
        } else {
            // use default (24 hours)
            None
        };
        // check for updates
        let _ = display_update_check(
            "nrz",
            "https://github.com/khulnasoft/nrzrepo",
            Some(&footer),
            current_version,
            // use default for timeout (800ms)
            None,
            interval,
        );
    }
}

pub fn run() -> Result<i32, Error> {
    let args = ShimArgs::parse()?;
    let color_config = args.color_config();
    if color_config.should_strip_ansi {
        // Let's not crash just because we failed to set up the hook
        let _ = miette::set_hook(Box::new(|_| {
            Box::new(
                miette::MietteHandlerOpts::new()
                    .color(false)
                    .unicode(false)
                    .build(),
            )
        }));
    }
    let subscriber = NrzSubscriber::new_with_verbosity(args.verbosity, &color_config);

    debug!("Global nrz version: {}", get_version());

    // If skip_infer is passed, we're probably running local nrz with
    // global nrz having handled the inference. We can run without any
    // concerns.
    if args.skip_infer {
        return Ok(cli::run(None, &subscriber, color_config)?);
    }

    // If the NRZ_BINARY_PATH is set, we do inference but we do not use
    // it to execute local nrz. We simply use it to set the `--single-package`
    // and `--cwd` flags.
    if is_nrz_binary_path_set() {
        let repo_state = RepoState::infer(&args.cwd)?;
        debug!("Repository Root: {}", repo_state.root);
        return Ok(cli::run(Some(repo_state), &subscriber, color_config)?);
    }

    match RepoState::infer(&args.cwd) {
        Ok(repo_state) => {
            debug!("Repository Root: {}", repo_state.root);
            run_correct_nrz(repo_state, args, &subscriber, color_config)
        }
        Err(err) => {
            // If we cannot infer, we still run global nrz. This allows for global
            // commands like login/logout/link/unlink to still work
            debug!("Repository inference failed: {}", err);
            debug!("Running command as global nrz");
            Ok(cli::run(None, &subscriber, color_config)?)
        }
    }
}

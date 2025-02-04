use std::collections::HashMap;

use nrzpath::{AbsoluteSystemPath, AbsoluteSystemPathBuf};
use nrzrepo_errors::Spanned;
use nrzrepo_repository::{
    package_graph::{PackageInfo, PackageName},
    package_json::PackageJson,
};
use tracing::debug;

use super::{NrzJson, Pipeline, RawTaskDefinition, CONFIG_FILE};
use crate::{
    cli::EnvMode,
    config::Error,
    microfrontends::MicrofrontendsConfigs,
    run::{task_access::TASK_ACCESS_CONFIG_PATH, task_id::TaskName},
};

/// Structure for loading NrzJson structures.
/// Depending on the strategy used, NrzJson might not correspond to
/// `nrz.json` file.
#[derive(Debug, Clone)]
pub struct NrzJsonLoader {
    repo_root: AbsoluteSystemPathBuf,
    cache: HashMap<PackageName, NrzJson>,
    strategy: Strategy,
}

#[derive(Debug, Clone)]
enum Strategy {
    SinglePackage {
        root_nrz_json: AbsoluteSystemPathBuf,
        package_json: PackageJson,
    },
    Workspace {
        // Map of package names to their package specific nrz.json
        packages: HashMap<PackageName, AbsoluteSystemPathBuf>,
        micro_frontends_configs: Option<MicrofrontendsConfigs>,
    },
    WorkspaceNoNrzJson {
        // Map of package names to their scripts
        packages: HashMap<PackageName, Vec<String>>,
        microfrontends_configs: Option<MicrofrontendsConfigs>,
    },
    TaskAccess {
        root_nrz_json: AbsoluteSystemPathBuf,
        package_json: PackageJson,
    },
    Noop,
}

impl NrzJsonLoader {
    /// Create a loader that will load nrz.json files throughout the workspace
    pub fn workspace<'a>(
        repo_root: AbsoluteSystemPathBuf,
        root_nrz_json_path: AbsoluteSystemPathBuf,
        packages: impl Iterator<Item = (&'a PackageName, &'a PackageInfo)>,
    ) -> Self {
        let packages = package_nrz_jsons(&repo_root, root_nrz_json_path, packages);
        Self {
            repo_root,
            cache: HashMap::new(),
            strategy: Strategy::Workspace {
                packages,
                micro_frontends_configs: None,
            },
        }
    }

    /// Create a loader that will load nrz.json files throughout the workspace
    pub fn workspace_with_microfrontends<'a>(
        repo_root: AbsoluteSystemPathBuf,
        root_nrz_json_path: AbsoluteSystemPathBuf,
        packages: impl Iterator<Item = (&'a PackageName, &'a PackageInfo)>,
        micro_frontends_configs: MicrofrontendsConfigs,
    ) -> Self {
        let packages = package_nrz_jsons(&repo_root, root_nrz_json_path, packages);
        Self {
            repo_root,
            cache: HashMap::new(),
            strategy: Strategy::Workspace {
                packages,
                micro_frontends_configs: Some(micro_frontends_configs),
            },
        }
    }

    /// Create a loader that will construct nrz.json structures based on
    /// workspace `package.json`s.
    pub fn workspace_no_nrz_json<'a>(
        repo_root: AbsoluteSystemPathBuf,
        packages: impl Iterator<Item = (&'a PackageName, &'a PackageInfo)>,
        microfrontends_configs: Option<MicrofrontendsConfigs>,
    ) -> Self {
        let packages = workspace_package_scripts(packages);
        Self {
            repo_root,
            cache: HashMap::new(),
            strategy: Strategy::WorkspaceNoNrzJson {
                packages,
                microfrontends_configs,
            },
        }
    }

    /// Create a loader that will load a root nrz.json or synthesize one if
    /// the file doesn't exist
    pub fn single_package(
        repo_root: AbsoluteSystemPathBuf,
        root_nrz_json: AbsoluteSystemPathBuf,
        package_json: PackageJson,
    ) -> Self {
        Self {
            repo_root,
            cache: HashMap::new(),
            strategy: Strategy::SinglePackage {
                root_nrz_json,
                package_json,
            },
        }
    }

    /// Create a loader that will load a root nrz.json or synthesize one if
    /// the file doesn't exist
    pub fn task_access(
        repo_root: AbsoluteSystemPathBuf,
        root_nrz_json: AbsoluteSystemPathBuf,
        package_json: PackageJson,
    ) -> Self {
        Self {
            repo_root,
            cache: HashMap::new(),
            strategy: Strategy::TaskAccess {
                root_nrz_json,
                package_json,
            },
        }
    }

    /// Create a loader that will only return provided nrz.jsons and will
    /// never hit the file system.
    /// Primarily intended for testing
    pub fn noop(nrz_jsons: HashMap<PackageName, NrzJson>) -> Self {
        Self {
            // This never gets read from so we populate it with
            repo_root: AbsoluteSystemPath::new(if cfg!(windows) { "C:\\" } else { "/" })
                .expect("wasn't able to create absolute system path")
                .to_owned(),
            cache: nrz_jsons,
            strategy: Strategy::Noop,
        }
    }

    /// Load a nrz.json for a given package
    pub fn load<'a>(&'a mut self, package: &PackageName) -> Result<&'a NrzJson, Error> {
        if !self.cache.contains_key(package) {
            let nrz_json = self.uncached_load(package)?;
            self.cache.insert(package.clone(), nrz_json);
        }
        Ok(self
            .cache
            .get(package)
            .expect("just inserted value for this key"))
    }

    fn uncached_load(&self, package: &PackageName) -> Result<NrzJson, Error> {
        match &self.strategy {
            Strategy::SinglePackage {
                package_json,
                root_nrz_json,
            } => {
                if !matches!(package, PackageName::Root) {
                    Err(Error::InvalidNrzJsonLoad(package.clone()))
                } else {
                    load_from_root_package_json(&self.repo_root, root_nrz_json, package_json)
                }
            }
            Strategy::Workspace {
                packages,
                micro_frontends_configs,
            } => {
                let path = packages.get(package).ok_or_else(|| Error::NoNrzJSON)?;
                let nrz_json = load_from_file(&self.repo_root, path);
                if let Some(mfe_configs) = micro_frontends_configs {
                    mfe_configs.update_nrz_json(package, nrz_json)
                } else {
                    nrz_json
                }
            }
            Strategy::WorkspaceNoNrzJson {
                packages,
                microfrontends_configs,
            } => {
                let script_names = packages.get(package).ok_or(Error::NoNrzJSON)?;
                if matches!(package, PackageName::Root) {
                    root_nrz_json_from_scripts(script_names)
                } else {
                    let nrz_json = workspace_nrz_json_from_scripts(script_names);
                    if let Some(mfe_configs) = microfrontends_configs {
                        mfe_configs.update_nrz_json(package, nrz_json)
                    } else {
                        nrz_json
                    }
                }
            }
            Strategy::TaskAccess {
                package_json,
                root_nrz_json,
            } => {
                if !matches!(package, PackageName::Root) {
                    Err(Error::InvalidNrzJsonLoad(package.clone()))
                } else {
                    load_task_access_trace_nrz_json(&self.repo_root, root_nrz_json, package_json)
                }
            }
            Strategy::Noop => Err(Error::NoNrzJSON),
        }
    }
}

/// Map all packages in the package graph to their nrz.json path
fn package_nrz_jsons<'a>(
    repo_root: &AbsoluteSystemPath,
    root_nrz_json_path: AbsoluteSystemPathBuf,
    packages: impl Iterator<Item = (&'a PackageName, &'a PackageInfo)>,
) -> HashMap<PackageName, AbsoluteSystemPathBuf> {
    let mut package_nrz_jsons = HashMap::new();
    package_nrz_jsons.insert(PackageName::Root, root_nrz_json_path);
    package_nrz_jsons.extend(packages.filter_map(|(pkg, info)| {
        if pkg == &PackageName::Root {
            None
        } else {
            Some((
                pkg.clone(),
                repo_root
                    .resolve(info.package_path())
                    .join_component(CONFIG_FILE),
            ))
        }
    }));
    package_nrz_jsons
}

/// Map all packages in the package graph to their scripts
fn workspace_package_scripts<'a>(
    packages: impl Iterator<Item = (&'a PackageName, &'a PackageInfo)>,
) -> HashMap<PackageName, Vec<String>> {
    packages
        .map(|(pkg, info)| {
            (
                pkg.clone(),
                info.package_json.scripts.keys().cloned().collect(),
            )
        })
        .collect()
}

fn load_from_file(
    repo_root: &AbsoluteSystemPath,
    nrz_json_path: &AbsoluteSystemPath,
) -> Result<NrzJson, Error> {
    match NrzJson::read(repo_root, nrz_json_path) {
        // If the file didn't exist, throw a custom error here instead of propagating
        Err(Error::Io(_)) => Err(Error::NoNrzJSON),
        // There was an error, and we don't have any chance of recovering
        // because we aren't synthesizing anything
        Err(e) => Err(e),
        // We're not synthesizing anything and there was no error, we're done
        Ok(nrz) => Ok(nrz),
    }
}

fn load_from_root_package_json(
    repo_root: &AbsoluteSystemPath,
    nrz_json_path: &AbsoluteSystemPath,
    root_package_json: &PackageJson,
) -> Result<NrzJson, Error> {
    let mut nrz_json = match NrzJson::read(repo_root, nrz_json_path) {
        // we're synthesizing, but we have a starting point
        // Note: this will have to change to support task inference in a monorepo
        // for now, we're going to error on any "root" tasks and turn non-root tasks into root
        // tasks
        Ok(mut nrz_json) => {
            let mut pipeline = Pipeline::default();
            for (task_name, task_definition) in nrz_json.tasks {
                if task_name.is_package_task() {
                    let (span, text) = task_definition.span_and_text("nrz.json");

                    return Err(Error::PackageTaskInSinglePackageMode {
                        task_id: task_name.to_string(),
                        span,
                        text,
                    });
                }

                pipeline.insert(task_name.into_root_task(), task_definition);
            }

            nrz_json.tasks = pipeline;

            nrz_json
        }
        // nrz.json doesn't exist, but we're going try to synthesize something
        Err(Error::Io(_)) => NrzJson::default(),
        // some other happened, we can't recover
        Err(e) => {
            return Err(e);
        }
    };

    // TODO: Add location info from package.json
    for script_name in root_package_json.scripts.keys() {
        let task_name = TaskName::from(script_name.as_str());
        if !nrz_json.has_task(&task_name) {
            let task_name = task_name.into_root_task();
            // Explicitly set cache to Some(false) in this definition
            // so we can pretend it was set on purpose. That way it
            // won't get clobbered by the merge function.
            nrz_json.tasks.insert(
                task_name,
                Spanned::new(RawTaskDefinition {
                    cache: Some(Spanned::new(false)),
                    ..RawTaskDefinition::default()
                }),
            );
        }
    }

    Ok(nrz_json)
}

fn root_nrz_json_from_scripts(scripts: &[String]) -> Result<NrzJson, Error> {
    let mut nrz_json = NrzJson {
        ..Default::default()
    };
    for script in scripts {
        let task_name = TaskName::from(script.as_str()).into_root_task();
        nrz_json.tasks.insert(
            task_name,
            Spanned::new(RawTaskDefinition {
                cache: Some(Spanned::new(false)),
                env_mode: Some(EnvMode::Loose),
                ..Default::default()
            }),
        );
    }
    Ok(nrz_json)
}

fn workspace_nrz_json_from_scripts(scripts: &[String]) -> Result<NrzJson, Error> {
    let mut nrz_json = NrzJson {
        extends: Spanned::new(vec!["//".to_owned()]),
        ..Default::default()
    };
    for script in scripts {
        let task_name = TaskName::from(script.clone());
        nrz_json.tasks.insert(
            task_name,
            Spanned::new(RawTaskDefinition {
                cache: Some(Spanned::new(false)),
                env_mode: Some(EnvMode::Loose),
                ..Default::default()
            }),
        );
    }
    Ok(nrz_json)
}

fn load_task_access_trace_nrz_json(
    repo_root: &AbsoluteSystemPath,
    nrz_json_path: &AbsoluteSystemPath,
    root_package_json: &PackageJson,
) -> Result<NrzJson, Error> {
    let trace_json_path = repo_root.join_components(&TASK_ACCESS_CONFIG_PATH);
    let nrz_from_trace = NrzJson::read(repo_root, &trace_json_path);

    // check the zero config case (nrz trace file, but no nrz.json file)
    if let Ok(nrz_from_trace) = nrz_from_trace {
        if !nrz_json_path.exists() {
            debug!("Using nrz.json synthesized from trace file");
            return Ok(nrz_from_trace);
        }
    }
    load_from_root_package_json(repo_root, nrz_json_path, root_package_json)
}

#[cfg(test)]
mod test {
    use std::{collections::BTreeMap, fs};

    use anyhow::Result;
    use nrzrepo_unescape::UnescapedString;
    use tempfile::tempdir;
    use test_case::test_case;

    use super::*;
    use crate::{nrz_json::CONFIG_FILE, task_graph::TaskDefinition};

    #[test_case(r"{}", NrzJson::default() ; "empty")]
    #[test_case(r#"{ "globalDependencies": ["tsconfig.json", "jest.config.ts"] }"#,
        NrzJson {
            global_deps: vec!["jest.config.ts".to_string(), "tsconfig.json".to_string()],
            ..NrzJson::default()
        }
    ; "global dependencies (sorted)")]
    #[test_case(r#"{ "globalPassThroughEnv": ["GITHUB_TOKEN", "AWS_SECRET_KEY"] }"#,
        NrzJson {
            global_pass_through_env: Some(vec!["AWS_SECRET_KEY".to_string(), "GITHUB_TOKEN".to_string()]),
            ..NrzJson::default()
        }
    )]
    #[test_case(r#"{ "//": "A comment"}"#, NrzJson::default() ; "faux comment")]
    #[test_case(r#"{ "//": "A comment", "//": "Another comment" }"#, NrzJson::default() ; "two faux comments")]
    fn test_get_root_nrz_no_synthesizing(
        nrz_json_content: &str,
        expected_nrz_json: NrzJson,
    ) -> Result<()> {
        let root_dir = tempdir()?;
        let repo_root = AbsoluteSystemPath::from_std_path(root_dir.path())?;
        let root_nrz_json = repo_root.join_component("nrz.json");
        fs::write(&root_nrz_json, nrz_json_content)?;
        let mut loader = NrzJsonLoader {
            repo_root: repo_root.to_owned(),
            cache: HashMap::new(),
            strategy: Strategy::Workspace {
                packages: vec![(PackageName::Root, root_nrz_json)]
                    .into_iter()
                    .collect(),
                micro_frontends_configs: None,
            },
        };

        let mut nrz_json = loader.load(&PackageName::Root)?.clone();

        nrz_json.text = None;
        nrz_json.path = None;
        assert_eq!(nrz_json, expected_nrz_json);

        Ok(())
    }

    #[test_case(
        None,
        PackageJson {
             scripts: [("build".to_string(), Spanned::new("echo build".to_string()))].into_iter().collect(),
             ..PackageJson::default()
        },
        NrzJson {
            tasks: Pipeline([(
                "//#build".into(),
                Spanned::new(RawTaskDefinition {
                    cache: Some(Spanned::new(false)),
                    ..RawTaskDefinition::default()
                })
              )].into_iter().collect()
            ),
            ..NrzJson::default()
        }
    )]
    #[test_case(
        Some(r#"{
            "tasks": {
                "build": {
                    "cache": true
                }
            }
        }"#),
        PackageJson {
             scripts: [("test".to_string(), Spanned::new("echo test".to_string()))].into_iter().collect(),
             ..PackageJson::default()
        },
        NrzJson {
            tasks: Pipeline([(
                "//#build".into(),
                Spanned::new(RawTaskDefinition {
                    cache: Some(Spanned::new(true).with_range(81..85)),
                    ..RawTaskDefinition::default()
                }).with_range(50..103)
            ),
            (
                "//#test".into(),
                Spanned::new(RawTaskDefinition {
                     cache: Some(Spanned::new(false)),
                    ..RawTaskDefinition::default()
                })
            )].into_iter().collect()),
            ..NrzJson::default()
        }
    )]
    fn test_get_root_nrz_with_synthesizing(
        nrz_json_content: Option<&str>,
        root_package_json: PackageJson,
        expected_nrz_json: NrzJson,
    ) -> Result<()> {
        let root_dir = tempdir()?;
        let repo_root = AbsoluteSystemPath::from_std_path(root_dir.path())?;
        let root_nrz_json = repo_root.join_component(CONFIG_FILE);

        if let Some(content) = nrz_json_content {
            fs::write(&root_nrz_json, content)?;
        }

        let mut loader =
            NrzJsonLoader::single_package(repo_root.to_owned(), root_nrz_json, root_package_json);
        let mut nrz_json = loader.load(&PackageName::Root)?.clone();
        nrz_json.text = None;
        nrz_json.path = None;
        for (_, task_definition) in nrz_json.tasks.iter_mut() {
            task_definition.path = None;
            task_definition.text = None;
        }
        assert_eq!(nrz_json, expected_nrz_json);

        Ok(())
    }

    #[test_case(
        Some(r#"{ "tasks": {"//#build": {"env": ["SPECIAL_VAR"]}} }"#),
        Some(r#"{ "tasks": {"build": {"env": ["EXPLICIT_VAR"]}} }"#),
        TaskDefinition { env: vec!["EXPLICIT_VAR".to_string()], .. Default::default() }
    ; "both present")]
    #[test_case(
        None,
        Some(r#"{ "tasks": {"build": {"env": ["EXPLICIT_VAR"]}} }"#),
        TaskDefinition { env: vec!["EXPLICIT_VAR".to_string()], .. Default::default() }
    ; "no trace")]
    #[test_case(
        Some(r#"{ "tasks": {"//#build": {"env": ["SPECIAL_VAR"]}} }"#),
        None,
        TaskDefinition { env: vec!["SPECIAL_VAR".to_string()], .. Default::default() }
    ; "no nrz.json")]
    #[test_case(
        None,
        None,
        TaskDefinition { cache: false, .. Default::default() }
    ; "both missing")]
    fn test_task_access_loading(
        trace_contents: Option<&str>,
        nrz_json_content: Option<&str>,
        expected_root_build: TaskDefinition,
    ) -> Result<()> {
        let root_dir = tempdir()?;
        let repo_root = AbsoluteSystemPath::from_std_path(root_dir.path())?;
        let root_nrz_json = repo_root.join_component(CONFIG_FILE);

        if let Some(content) = nrz_json_content {
            root_nrz_json.create_with_contents(content.as_bytes())?;
        }
        if let Some(content) = trace_contents {
            let trace_path = repo_root.join_components(&TASK_ACCESS_CONFIG_PATH);
            trace_path.ensure_dir()?;
            trace_path.create_with_contents(content.as_bytes())?;
        }

        let mut scripts = BTreeMap::new();
        scripts.insert("build".into(), Spanned::new("echo building".into()));
        let root_package_json = PackageJson {
            scripts,
            ..Default::default()
        };

        let mut loader =
            NrzJsonLoader::task_access(repo_root.to_owned(), root_nrz_json, root_package_json);
        let nrz_json = loader.load(&PackageName::Root)?;
        let root_build = nrz_json
            .tasks
            .get(&TaskName::from("//#build"))
            .expect("root build should always exist")
            .as_inner();

        assert_eq!(
            expected_root_build,
            TaskDefinition::try_from(root_build.clone())?
        );

        Ok(())
    }

    #[test]
    fn test_single_package_loading_non_root() {
        let junk_path = AbsoluteSystemPath::new(if cfg!(windows) {
            "C:\\never\\loaded"
        } else {
            "/never/loaded"
        })
        .unwrap();
        let non_root = PackageName::from("some-pkg");
        let single_loader = NrzJsonLoader::single_package(
            junk_path.to_owned(),
            junk_path.to_owned(),
            PackageJson::default(),
        );
        let task_access_loader = NrzJsonLoader::task_access(
            junk_path.to_owned(),
            junk_path.to_owned(),
            PackageJson::default(),
        );

        for mut loader in [single_loader, task_access_loader] {
            let result = loader.load(&non_root);
            assert!(result.is_err());
            let err = result.unwrap_err();
            assert!(
                matches!(err, Error::InvalidNrzJsonLoad(_)),
                "expected {err} to be no nrz json"
            );
        }
    }

    #[test]
    fn test_workspace_nrz_json_loading() {
        let root_dir = tempdir().unwrap();
        let repo_root = AbsoluteSystemPath::from_std_path(root_dir.path()).unwrap();
        let a_nrz_json = repo_root.join_components(&["packages", "a", "nrz.json"]);
        a_nrz_json.ensure_dir().unwrap();
        let packages = vec![(PackageName::from("a"), a_nrz_json.clone())]
            .into_iter()
            .collect();

        let mut loader = NrzJsonLoader {
            repo_root: repo_root.to_owned(),
            cache: HashMap::new(),
            strategy: Strategy::Workspace {
                packages,
                micro_frontends_configs: None,
            },
        };
        let result = loader.load(&PackageName::from("a"));
        assert!(
            matches!(result.unwrap_err(), Error::NoNrzJSON),
            "expected parsing to fail with missing nrz.json"
        );

        a_nrz_json
            .create_with_contents(r#"{"tasks": {"build": {}}}"#)
            .unwrap();

        let nrz_json = loader.load(&PackageName::from("a")).unwrap();
        assert_eq!(nrz_json.tasks.len(), 1);
    }

    #[test]
    fn test_nrz_json_caching() {
        let root_dir = tempdir().unwrap();
        let repo_root = AbsoluteSystemPath::from_std_path(root_dir.path()).unwrap();
        let a_nrz_json = repo_root.join_components(&["packages", "a", "nrz.json"]);
        a_nrz_json.ensure_dir().unwrap();
        let packages = vec![(PackageName::from("a"), a_nrz_json.clone())]
            .into_iter()
            .collect();

        let mut loader = NrzJsonLoader {
            repo_root: repo_root.to_owned(),
            cache: HashMap::new(),
            strategy: Strategy::Workspace {
                packages,
                micro_frontends_configs: None,
            },
        };
        a_nrz_json
            .create_with_contents(r#"{"tasks": {"build": {}}}"#)
            .unwrap();

        let nrz_json = loader.load(&PackageName::from("a")).unwrap();
        assert_eq!(nrz_json.tasks.len(), 1);
        a_nrz_json.remove().unwrap();
        assert!(loader.load(&PackageName::from("a")).is_ok());
    }

    #[test]
    fn test_no_nrz_json() {
        let root_dir = tempdir().unwrap();
        let repo_root = AbsoluteSystemPath::from_std_path(root_dir.path()).unwrap();
        let packages = vec![
            (
                PackageName::Root,
                vec!["build".to_owned(), "lint".to_owned(), "test".to_owned()],
            ),
            (
                PackageName::from("pkg-a"),
                vec!["build".to_owned(), "lint".to_owned(), "special".to_owned()],
            ),
        ]
        .into_iter()
        .collect();

        let mut loader = NrzJsonLoader {
            repo_root: repo_root.to_owned(),
            cache: HashMap::new(),
            strategy: Strategy::WorkspaceNoNrzJson {
                packages,
                microfrontends_configs: None,
            },
        };

        {
            let root_json = loader.load(&PackageName::Root).unwrap();
            for task_name in ["//#build", "//#lint", "//#test"] {
                if let Some(def) = root_json.tasks.get(&TaskName::from(task_name)) {
                    assert_eq!(
                        def.cache.as_ref().map(|cache| *cache.as_inner()),
                        Some(false)
                    );
                } else {
                    panic!("didn't find {task_name}");
                }
            }
        }

        {
            let pkg_a_json = loader.load(&PackageName::from("pkg-a")).unwrap();
            for task_name in ["build", "lint", "special"] {
                if let Some(def) = pkg_a_json.tasks.get(&TaskName::from(task_name)) {
                    assert_eq!(
                        def.cache.as_ref().map(|cache| *cache.as_inner()),
                        Some(false)
                    );
                } else {
                    panic!("didn't find {task_name}");
                }
            }
        }
        // Should get no nrz.json error if package wasn't declared
        let goose_err = loader.load(&PackageName::from("goose")).unwrap_err();
        assert!(matches!(goose_err, Error::NoNrzJSON));
    }

    #[test]
    fn test_no_nrz_json_with_mfe() {
        let root_dir = tempdir().unwrap();
        let repo_root = AbsoluteSystemPath::from_std_path(root_dir.path()).unwrap();
        let packages = vec![
            (PackageName::Root, vec![]),
            (
                PackageName::from("web"),
                vec!["dev".to_owned(), "build".to_owned()],
            ),
            (
                PackageName::from("docs"),
                vec!["dev".to_owned(), "build".to_owned()],
            ),
        ]
        .into_iter()
        .collect();

        let microfrontends_configs = MicrofrontendsConfigs::from_configs(
            vec![
                (
                    "web",
                    nrzrepo_microfrontends::Config::from_str(
                        r#"{"version": "1", "applications": {"web": {}, "docs": {}}}"#,
                        "mfe.json",
                    )
                    .map(Some),
                ),
                (
                    "docs",
                    Err(nrzrepo_microfrontends::Error::ChildConfig {
                        reference: "web".into(),
                    }),
                ),
            ]
            .into_iter(),
        )
        .unwrap();

        let mut loader = NrzJsonLoader {
            repo_root: repo_root.to_owned(),
            cache: HashMap::new(),
            strategy: Strategy::WorkspaceNoNrzJson {
                packages,
                microfrontends_configs,
            },
        };

        {
            let web_json = loader.load(&PackageName::from("web")).unwrap();
            for task_name in ["dev", "build", "proxy"] {
                if let Some(def) = web_json.tasks.get(&TaskName::from(task_name)) {
                    assert_eq!(
                        def.cache.as_ref().map(|cache| *cache.as_inner()),
                        Some(false)
                    );
                    // Make sure proxy is in there
                    if task_name == "dev" {
                        assert_eq!(
                            def.siblings.as_ref().unwrap().first().unwrap().as_inner(),
                            &UnescapedString::from("web#proxy")
                        )
                    }
                } else {
                    panic!("didn't find {task_name}");
                }
            }
        }

        {
            let docs_json = loader.load(&PackageName::from("docs")).unwrap();
            for task_name in ["dev"] {
                if let Some(def) = docs_json.tasks.get(&TaskName::from(task_name)) {
                    assert_eq!(
                        def.cache.as_ref().map(|cache| *cache.as_inner()),
                        Some(false)
                    );
                    assert_eq!(
                        def.siblings.as_ref().unwrap().first().unwrap().as_inner(),
                        &UnescapedString::from("web#proxy")
                    )
                } else {
                    panic!("didn't find {task_name}");
                }
            }
        }
    }
}

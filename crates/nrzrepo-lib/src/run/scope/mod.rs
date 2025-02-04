mod change_detector;
pub mod filter;
mod simple_glob;
pub mod target_selector;

use std::collections::HashMap;

use filter::{FilterResolver, PackageInference};
use nrzpath::AbsoluteSystemPath;
use nrzrepo_repository::{
    change_mapper::PackageInclusionReason,
    package_graph::{PackageGraph, PackageName},
};
use nrzrepo_scm::SCM;

pub use crate::run::scope::filter::ResolutionError;
use crate::{nrz_json::NrzJson, opts::ScopeOpts};

#[tracing::instrument(skip(opts, pkg_graph, scm))]
pub fn resolve_packages(
    opts: &ScopeOpts,
    nrz_root: &AbsoluteSystemPath,
    pkg_graph: &PackageGraph,
    scm: &SCM,
    root_nrz_json: &NrzJson,
) -> Result<(HashMap<PackageName, PackageInclusionReason>, bool), ResolutionError> {
    let pkg_inference = opts.pkg_inference_root.as_ref().map(|pkg_inference_path| {
        PackageInference::calculate(nrz_root, pkg_inference_path, pkg_graph)
    });

    FilterResolver::new(opts, pkg_graph, nrz_root, pkg_inference, scm, root_nrz_json)?
        .resolve(&opts.affected_range, &opts.get_filters())
}

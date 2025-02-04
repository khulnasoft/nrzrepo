// Bump all rust changes
#![deny(clippy::all)]

use std::process;

use anyhow::Result;
use miette::Report;

// This function should not expanded. Please add any logic to
// `nrzrepo_lib::main` instead
fn main() -> Result<()> {
    std::panic::set_hook(Box::new(nrzrepo_lib::panic_handler));

    let exit_code = nrzrepo_lib::main().unwrap_or_else(|err| {
        eprintln!("{:?}", Report::new(err));
        1
    });

    process::exit(exit_code)
}

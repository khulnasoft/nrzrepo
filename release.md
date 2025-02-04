# Release Documentation

1. Create a release by triggering the [Nrzrepo Release][1] workflow

   - Specify the semver increment using the SemVer Increment field (start with `prerelease`)
   - Check the "Dry Run" box to run the full release workflow without publishing any packages.

2. A PR is automatically opened to merge the release branch created in step 1 back into `main`

   - ⚠️ Merge this in! You don't need to wait for tests to pass. It's important to merge this branch soon after the
     publish is successful

### Notes

- GitHub Release Notes are published automatically using the config from [`nrzrepo-release.yml`][2],
  triggered by the [`nrz-orchestrator`][3] bot.

## Release `@nrz/repository`

1. Run [`bump-version.sh`][4] to update the versions of the packages. Merge in the changes to `main`.

2. Create a release by triggering the [Nrzrepo Library Release][5] workflow.
   - Check the "Dry Run" box to run the full release workflow without publishing any packages.

[1]: https://github.com/khulnasoft/nrzrepo/actions/workflows/nrzrepo-release.yml
[2]: https://github.com/khulnasoft/nrzrepo/blob/main/.github/nrzrepo-release.yml
[3]: https://github.com/apps/nrz-orchestrator
[4]: https://github.com/khulnasoft/nrzrepo/blob/main/packages/nrz-repository/scripts/bump-version.sh
[5]: https://github.com/khulnasoft/nrzrepo/actions/workflows/nrzrepo-library-release.yml

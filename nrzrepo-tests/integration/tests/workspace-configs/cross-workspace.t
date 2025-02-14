Setup
  $ . ${TESTDIR}/../../../helpers/setup_integration_test.sh composable_config
  $ ${NRZ} run cross-workspace-task --filter=cross-workspace
  \xe2\x80\xa2 Packages in scope: cross-workspace (esc)
  \xe2\x80\xa2 Running cross-workspace-task in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  blank-pkg:cross-workspace-underlying-task: cache miss, executing 8474b66250718727
  blank-pkg:cross-workspace-underlying-task: 
  blank-pkg:cross-workspace-underlying-task: > cross-workspace-underlying-task
  blank-pkg:cross-workspace-underlying-task: > echo cross-workspace-underlying-task from blank-pkg
  blank-pkg:cross-workspace-underlying-task: 
  blank-pkg:cross-workspace-underlying-task: cross-workspace-underlying-task from blank-pkg
  cross-workspace:cross-workspace-task: cache miss, executing 5989221987f91bff
  cross-workspace:cross-workspace-task: 
  cross-workspace:cross-workspace-task: > cross-workspace-task
  cross-workspace:cross-workspace-task: > echo cross-workspace-task
  cross-workspace:cross-workspace-task: 
  cross-workspace:cross-workspace-task: cross-workspace-task
  
   Tasks:    2 successful, 2 total
  Cached:    0 cached, 2 total
    Time:\s*[\.0-9]+m?s  (re)
  
  $ ${NRZ} run cross-workspace#cross-workspace-task
  \xe2\x80\xa2 Packages in scope: add-keys, add-tasks, bad-json, blank-pkg, cached, config-change, cross-workspace, invalid-config, missing-workspace-config, omit-keys, override-values, persistent (esc)
  \xe2\x80\xa2 Running cross-workspace#cross-workspace-task in 12 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  blank-pkg:cross-workspace-underlying-task: cache hit, replaying logs 8474b66250718727
  blank-pkg:cross-workspace-underlying-task: 
  blank-pkg:cross-workspace-underlying-task: > cross-workspace-underlying-task
  blank-pkg:cross-workspace-underlying-task: > echo cross-workspace-underlying-task from blank-pkg
  blank-pkg:cross-workspace-underlying-task: 
  blank-pkg:cross-workspace-underlying-task: cross-workspace-underlying-task from blank-pkg
  cross-workspace:cross-workspace-task: cache hit, replaying logs 5989221987f91bff
  cross-workspace:cross-workspace-task: 
  cross-workspace:cross-workspace-task: > cross-workspace-task
  cross-workspace:cross-workspace-task: > echo cross-workspace-task
  cross-workspace:cross-workspace-task: 
  cross-workspace:cross-workspace-task: cross-workspace-task
  
   Tasks:    2 successful, 2 total
  Cached:    2 cached, 2 total
    Time:\s*[\.0-9]+m?s >>> FULL NRZ (re)
  

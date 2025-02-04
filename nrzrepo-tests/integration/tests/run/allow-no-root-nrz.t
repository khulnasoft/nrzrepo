Setup
  $ . ${TESTDIR}/../../../helpers/setup_integration_test.sh monorepo_no_nrz_json

Run fails if not configured to allow missing nrz.json
  $ ${NRZ} test
    x Could not find nrz.json.
    | Follow directions at https://turbo.build/repo/docs to create one.
  
  [1]
Runs test tasks
  $ MY_VAR=foo ${NRZ} test --experimental-allow-no-nrz-json
  \xe2\x80\xa2 Packages in scope: another, my-app, util (esc)
  \xe2\x80\xa2 Running test in 3 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  my-app:test: cache bypass, force executing d80016a1a60c4c0a
  my-app:test: 
  my-app:test: > test
  my-app:test: > echo $MY_VAR
  my-app:test: 
  my-app:test: foo
  
   Tasks:    1 successful, 1 total
  Cached:    0 cached, 1 total
    Time:\s*[\.0-9]+m?s  (re)
  


Ensure caching is disabled
  $ MY_VAR=foo ${NRZ} test --experimental-allow-no-nrz-json
  \xe2\x80\xa2 Packages in scope: another, my-app, util (esc)
  \xe2\x80\xa2 Running test in 3 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  my-app:test: cache bypass, force executing d80016a1a60c4c0a
  my-app:test: 
  my-app:test: > test
  my-app:test: > echo $MY_VAR
  my-app:test: 
  my-app:test: foo
  
   Tasks:    1 successful, 1 total
  Cached:    0 cached, 1 total
    Time:\s*[\.0-9]+m?s  (re)
  
Finds all tasks based on scripts
  $ NRZ_ALLOW_NO_NRZ_JSON=true ${NRZ} build test --dry=json | jq '.tasks | map(.taskId)| sort'
  [
    "my-app#build",
    "my-app#test",
    "util#build"
  ]

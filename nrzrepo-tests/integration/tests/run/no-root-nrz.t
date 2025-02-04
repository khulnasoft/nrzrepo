Setup
  $ . ${TESTDIR}/../../../helpers/setup_integration_test.sh basic_monorepo
  $ mv nrz.json nrzrepo.json

Run without --root-nrz-json should fail
  $ ${NRZ} build
    x Could not find nrz.json.
    | Follow directions at https://turbo.build/repo/docs to create one.
  
  [1]

Run with --root-nrz-json should use specified config
  $ ${NRZ} build --filter=my-app --root-nrz-json=nrzrepo.json
  \xe2\x80\xa2 Packages in scope: my-app (esc)
  \xe2\x80\xa2 Running build in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  my-app:build: cache miss, executing 6d66bca0a23c3667
  my-app:build: 
  my-app:build: > build
  my-app:build: > echo building
  my-app:build: 
  my-app:build: building
  
   Tasks:    1 successful, 1 total
  Cached:    0 cached, 1 total
    Time:\s*[\.0-9]+m?s  (re)
  
   WARNING  no output files found for task my-app#build. Please check your `outputs` key in `nrz.json`

Run with NRZ_ROOT_NRZ_JSON should use specified config
  $ NRZ_ROOT_NRZ_JSON=nrzrepo.json ${NRZ} build --filter=my-app
  \xe2\x80\xa2 Packages in scope: my-app (esc)
  \xe2\x80\xa2 Running build in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  my-app:build: cache hit, replaying logs 6d66bca0a23c3667
  my-app:build: 
  my-app:build: > build
  my-app:build: > echo building
  my-app:build: 
  my-app:build: building
  
   Tasks:    1 successful, 1 total
  Cached:    1 cached, 1 total
    Time:\s*[\.0-9]+m?s >>> FULL NRZ (re)
  

Run with --continue

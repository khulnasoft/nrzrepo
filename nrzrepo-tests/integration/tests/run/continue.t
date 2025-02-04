Setup
  $ . ${TESTDIR}/../../../helpers/setup_integration_test.sh monorepo_dependency_error
Run without --continue
  $ ${NRZ} build
  \xe2\x80\xa2 Packages in scope: my-app, other-app, some-lib (esc)
  \xe2\x80\xa2 Running build in 3 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  some-lib:build: cache miss, executing d4497de5ac2d6cbd
  some-lib:build: 
  some-lib:build: > build
  some-lib:build: > exit 2
  some-lib:build: 
  some-lib:build: npm error Lifecycle script `build` failed with error:
  some-lib:build: npm error code 2
  some-lib:build: npm error path /tmp/prysk-tests-ebsr4nd1/continue.t/apps/some-lib
  some-lib:build: npm error workspace some-lib
  some-lib:build: npm error location /tmp/prysk-tests-ebsr4nd1/continue.t/apps/some-lib
  some-lib:build: npm error command failed
  some-lib:build: npm error command bash -c exit 2
  some-lib:build: ERROR: command finished with error: command (/tmp/prysk-tests-ebsr4nd1/continue.t/apps/some-lib) /home/gitpod/.nvm/versions/node/v22.11.0/bin/npm run build exited (2)
  some-lib#build: command (/tmp/prysk-tests-ebsr4nd1/continue.t/apps/some-lib) /home/gitpod/.nvm/versions/node/v22.11.0/bin/npm run build exited (2)
  
   Tasks:    0 successful, 1 total
  Cached:    0 cached, 1 total
    Time:\s*[\.0-9]+m?s  (re)
  Failed:    some-lib#build
  
   ERROR  run failed: command  exited (2)
  [2]


Run without --continue, and with only errors.
  $ ${NRZ} build --output-logs=errors-only
  \xe2\x80\xa2 Packages in scope: my-app, other-app, some-lib (esc)
  \xe2\x80\xa2 Running build in 3 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  some-lib:build: cache miss, executing d4497de5ac2d6cbd
  some-lib:build: 
  some-lib:build: > build
  some-lib:build: > exit 2
  some-lib:build: 
  some-lib:build: npm error Lifecycle script `build` failed with error:
  some-lib:build: npm error code 2
  some-lib:build: npm error path /tmp/prysk-tests-ebsr4nd1/continue.t/apps/some-lib
  some-lib:build: npm error workspace some-lib
  some-lib:build: npm error location /tmp/prysk-tests-ebsr4nd1/continue.t/apps/some-lib
  some-lib:build: npm error command failed
  some-lib:build: npm error command bash -c exit 2
  some-lib:build: ERROR: command finished with error: command (/tmp/prysk-tests-ebsr4nd1/continue.t/apps/some-lib) /home/gitpod/.nvm/versions/node/v22.11.0/bin/npm run build exited (2)
  some-lib#build: command (/tmp/prysk-tests-ebsr4nd1/continue.t/apps/some-lib) /home/gitpod/.nvm/versions/node/v22.11.0/bin/npm run build exited (2)
  
   Tasks:    0 successful, 1 total
  Cached:    0 cached, 1 total
    Time:\s*[\.0-9]+m?s  (re)
  Failed:    some-lib#build
  
   ERROR  run failed: command  exited (2)
  [2]

Run with --continue
  $ ${NRZ} build --output-logs=errors-only --continue
  \xe2\x80\xa2 Packages in scope: my-app, other-app, some-lib (esc)
  \xe2\x80\xa2 Running build in 3 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  some-lib:build: cache miss, executing d4497de5ac2d6cbd
  some-lib:build: 
  some-lib:build: > build
  some-lib:build: > exit 2
  some-lib:build: 
  some-lib:build: npm error Lifecycle script `build` failed with error:
  some-lib:build: npm error code 2
  some-lib:build: npm error path /tmp/prysk-tests-ebsr4nd1/continue.t/apps/some-lib
  some-lib:build: npm error workspace some-lib
  some-lib:build: npm error location /tmp/prysk-tests-ebsr4nd1/continue.t/apps/some-lib
  some-lib:build: npm error command failed
  some-lib:build: npm error command bash -c exit 2
  some-lib:build: command finished with error, but continuing...
  other-app:build: cache miss, executing 12046ed9b7bd37b3
  other-app:build: 
  other-app:build: > build
  other-app:build: > exit 3
  other-app:build: 
  other-app:build: npm error Lifecycle script `build` failed with error:
  other-app:build: npm error code 3
  other-app:build: npm error path /tmp/prysk-tests-ebsr4nd1/continue.t/apps/other-app
  other-app:build: npm error workspace other-app
  other-app:build: npm error location /tmp/prysk-tests-ebsr4nd1/continue.t/apps/other-app
  other-app:build: npm error command failed
  other-app:build: npm error command bash -c exit 3
  other-app:build: command finished with error, but continuing...
  some-lib#build: command (/tmp/prysk-tests-ebsr4nd1/continue.t/apps/some-lib) /home/gitpod/.nvm/versions/node/v22.11.0/bin/npm run build exited (2)
  other-app#build: command (/tmp/prysk-tests-ebsr4nd1/continue.t/apps/other-app) /home/gitpod/.nvm/versions/node/v22.11.0/bin/npm run build exited (3)
  
   Tasks:    1 successful, 3 total
  Cached:    0 cached, 3 total
    Time:\s*[\.0-9]+m?s  (re)
  Failed:    other-app#build, some-lib#build
  
   ERROR  run failed: command  exited (3)
  [3]

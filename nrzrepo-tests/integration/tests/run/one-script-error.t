Setup
  $ . ${TESTDIR}/../../../helpers/setup_integration_test.sh monorepo_one_script_error

Check error is properly reported
Note that npm reports any failed script as exit code 1, even though we "exit 2"
  $ ${NRZ} error
  \xe2\x80\xa2 Packages in scope: my-app (esc)
  \xe2\x80\xa2 Running error in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  my-app:okay: cache miss, executing ca41dd37af03fc0d
  my-app:okay: 
  my-app:okay: > okay
  my-app:okay: > echo working
  my-app:okay: 
  my-app:okay: working
  my-app:error: cache miss, executing 4179c5c202131f9e
  my-app:error: 
  my-app:error: > error
  my-app:error: > exit 2
  my-app:error: 
  my-app:error: npm error Lifecycle script `error` failed with error:
  my-app:error: npm error code 2
  my-app:error: npm error path /tmp/prysk-tests-eir4a5ob/one-script-error.t/apps/my-app
  my-app:error: npm error workspace my-app
  my-app:error: npm error location /tmp/prysk-tests-eir4a5ob/one-script-error.t/apps/my-app
  my-app:error: npm error command failed
  my-app:error: npm error command bash -c exit 2
  my-app:error: ERROR: command finished with error: command (/tmp/prysk-tests-eir4a5ob/one-script-error.t/apps/my-app) /home/gitpod/.nvm/versions/node/v22.11.0/bin/npm run error exited (2)
  my-app#error: command (/tmp/prysk-tests-eir4a5ob/one-script-error.t/apps/my-app) /home/gitpod/.nvm/versions/node/v22.11.0/bin/npm run error exited (2)
  
   Tasks:    1 successful, 2 total
  Cached:    0 cached, 2 total
    Time:\s*[\.0-9]+m?s  (re)
  Failed:    my-app#error
  
   ERROR  run failed: command  exited (2)
  [2]

Make sure error isn't cached
  $ ${NRZ} error
  \xe2\x80\xa2 Packages in scope: my-app (esc)
  \xe2\x80\xa2 Running error in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  my-app:okay: cache hit, replaying logs ca41dd37af03fc0d
  my-app:okay: 
  my-app:okay: > okay
  my-app:okay: > echo working
  my-app:okay: 
  my-app:okay: working
  my-app:error: cache miss, executing 4179c5c202131f9e
  my-app:error: 
  my-app:error: > error
  my-app:error: > exit 2
  my-app:error: 
  my-app:error: npm error Lifecycle script `error` failed with error:
  my-app:error: npm error code 2
  my-app:error: npm error path /tmp/prysk-tests-eir4a5ob/one-script-error.t/apps/my-app
  my-app:error: npm error workspace my-app
  my-app:error: npm error location /tmp/prysk-tests-eir4a5ob/one-script-error.t/apps/my-app
  my-app:error: npm error command failed
  my-app:error: npm error command bash -c exit 2
  my-app:error: ERROR: command finished with error: command (/tmp/prysk-tests-eir4a5ob/one-script-error.t/apps/my-app) /home/gitpod/.nvm/versions/node/v22.11.0/bin/npm run error exited (2)
  my-app#error: command (/tmp/prysk-tests-eir4a5ob/one-script-error.t/apps/my-app) /home/gitpod/.nvm/versions/node/v22.11.0/bin/npm run error exited (2)
  
   Tasks:    1 successful, 2 total
  Cached:    1 cached, 2 total
    Time:\s*[\.0-9]+m?s  (re)
  Failed:    my-app#error
  
   ERROR  run failed: command  exited (2)
  [2]

Make sure error code isn't swallowed with continue
  $ ${NRZ} okay2 --continue
  \xe2\x80\xa2 Packages in scope: my-app (esc)
  \xe2\x80\xa2 Running okay2 in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  my-app:okay: cache hit, replaying logs ca41dd37af03fc0d
  my-app:okay: 
  my-app:okay: > okay
  my-app:okay: > echo working
  my-app:okay: 
  my-app:okay: working
  my-app:error: cache miss, executing 4179c5c202131f9e
  my-app:error: 
  my-app:error: > error
  my-app:error: > exit 2
  my-app:error: 
  my-app:error: npm error Lifecycle script `error` failed with error:
  my-app:error: npm error code 2
  my-app:error: npm error path /tmp/prysk-tests-eir4a5ob/one-script-error.t/apps/my-app
  my-app:error: npm error workspace my-app
  my-app:error: npm error location /tmp/prysk-tests-eir4a5ob/one-script-error.t/apps/my-app
  my-app:error: npm error command failed
  my-app:error: npm error command bash -c exit 2
  my-app:error: command finished with error, but continuing...
  my-app:okay2: cache miss, executing 7e6f2cc34711872a
  my-app:okay2: 
  my-app:okay2: > okay2
  my-app:okay2: > echo working
  my-app:okay2: 
  my-app:okay2: working
  my-app#error: command (/tmp/prysk-tests-eir4a5ob/one-script-error.t/apps/my-app) /home/gitpod/.nvm/versions/node/v22.11.0/bin/npm run error exited (2)
  
   Tasks:    2 successful, 3 total
  Cached:    1 cached, 3 total
    Time:\s*[\.0-9]+m?s  (re)
  Failed:    my-app#error
  
   ERROR  run failed: command  exited (2)
  [2]

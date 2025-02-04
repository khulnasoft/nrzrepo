# Setup
  $ . ${TESTDIR}/../../../helpers/setup_integration_test.sh ordered

# Build as if we are in GitHub Actions
Note that we need to use (re) for lines that start with '> '
because otherwise prysk interprets them as multiline commands
  $ GITHUB_ACTIONS=1 ${NRZ} run build --force
  \xe2\x80\xa2 Packages in scope: my-app, util (esc)
  \xe2\x80\xa2 Running build in 2 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  ::group::my-app:build
  cache bypass, force executing 9947e0cefaeda3a8
  
  >\sbuild (re)
  \>\secho building && sleep 1 && echo done (re)
  
  building
  done
  ::endgroup::
  ::group::util:build
  cache bypass, force executing 7f63af9e61c46555
  
  >\sbuild (re)
  \>\ssleep 0.5 && echo building && sleep 1 && echo completed (re)
  
  building
  completed
  ::endgroup::
  
   Tasks:    2 successful, 2 total
  Cached:    0 cached, 2 total
    Time:\s*[\.0-9]+m?s  (re)
  
# Build as if we are in Github Actions with a task log prefix.
  $ GITHUB_ACTIONS=1 ${NRZ} run build --force --log-prefix="task" --filter=util
  \xe2\x80\xa2 Packages in scope: util (esc)
  \xe2\x80\xa2 Running build in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  ::group::util:build
  util:build: cache bypass, force executing 7f63af9e61c46555
  util:build: 
  util:build: > build
  util:build: > sleep 0.5 && echo building && sleep 1 && echo completed
  util:build: 
  util:build: building
  util:build: completed
  ::endgroup::
  
   Tasks:    1 successful, 1 total
  Cached:    0 cached, 1 total
    Time:\s*[\.0-9]+m?s  (re)
  

Verify that errors are grouped properly
  $ GITHUB_ACTIONS=1 ${NRZ} run fail
  \xe2\x80\xa2 Packages in scope: my-app, util (esc)
  \xe2\x80\xa2 Running fail in 2 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  \x1b[;31mutil:fail\x1b[;0m (esc)
  cache miss, executing 0b89b63e3294f710
  
  \> fail (re)
  \> echo failing; exit 1 (re)
  
  failing
  npm error Lifecycle script `fail` failed with error:
  npm error code 1
  npm error path /tmp/prysk-tests-eir4a5ob/log-order-github.t/packages/util
  npm error workspace util
  npm error location /tmp/prysk-tests-eir4a5ob/log-order-github.t/packages/util
  npm error command failed
  npm error command bash -c echo failing; exit 1
  [ERROR] command finished with error: command (/tmp/prysk-tests-eir4a5ob/log-order-github.t/packages/util) /home/gitpod/.nvm/versions/node/v22.11.0/bin/npm run fail exited (1)
  ::error::util#fail: command (/tmp/prysk-tests-eir4a5ob/log-order-github.t/packages/util) /home/gitpod/.nvm/versions/node/v22.11.0/bin/npm run fail exited (1)
  
   Tasks:    0 successful, 1 total
  Cached:    0 cached, 1 total
    Time:\s*[\.0-9]+m?s  (re)
  Failed:    util#fail
  
   ERROR  run failed: command  exited (1)
  [1]




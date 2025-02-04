Setup
  $ . ${TESTDIR}/../../../helpers/setup_integration_test.sh run_logging

# [ ] error exit
# [ ] outputLogs: errors-only
# [x] --ouptut-logs=errors-only
  $ ${NRZ} run build --output-logs=errors-only
  \xe2\x80\xa2 Packages in scope: app-a (esc)
  \xe2\x80\xa2 Running build in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  
   Tasks:    1 successful, 1 total
  Cached:    0 cached, 1 total
    Time:\s*[\.0-9]+m?s  (re)
  



# [ ] error exit
# [x] outputLogs: errors-only
# [ ] --ouptut-logs=errors-only
  $ ${NRZ} run buildsuccess
  \xe2\x80\xa2 Packages in scope: app-a (esc)
  \xe2\x80\xa2 Running buildsuccess in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  
   Tasks:    1 successful, 1 total
  Cached:    0 cached, 1 total
    Time:\s*[\.0-9]+m?s  (re)
  


# [x] error exit
# [ ] outputLogs: errors-only
# [x] --ouptut-logs=errors-only
  $ ${NRZ} run builderror --output-logs=errors-only
  \xe2\x80\xa2 Packages in scope: app-a (esc)
  \xe2\x80\xa2 Running builderror in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  app-a:builderror: cache miss, executing 2aa232411c549e9f
  app-a:builderror: 
  app-a:builderror: > builderror
  app-a:builderror: > echo error-builderror-app-a && exit 1
  app-a:builderror: 
  app-a:builderror: error-builderror-app-a
  app-a:builderror: npm error Lifecycle script `builderror` failed with error:
  app-a:builderror: npm error code 1
  app-a:builderror: npm error path /tmp/prysk-tests-eir4a5ob/errors-only.t/app-a
  app-a:builderror: npm error workspace app-a
  app-a:builderror: npm error location /tmp/prysk-tests-eir4a5ob/errors-only.t/app-a
  app-a:builderror: npm error command failed
  app-a:builderror: npm error command bash -c echo error-builderror-app-a && exit 1
  app-a:builderror: ERROR: command finished with error: command (/tmp/prysk-tests-eir4a5ob/errors-only.t/app-a) /home/gitpod/.nvm/versions/node/v22.11.0/bin/npm run builderror exited (1)
  app-a#builderror: command (/tmp/prysk-tests-eir4a5ob/errors-only.t/app-a) /home/gitpod/.nvm/versions/node/v22.11.0/bin/npm run builderror exited (1)
  
   Tasks:    0 successful, 1 total
  Cached:    0 cached, 1 total
    Time:\s*[\.0-9]+m?s  (re)
  Failed:    app-a#builderror
  
   ERROR  run failed: command  exited (1)
  [1]



# [x] error exit
# [x] outputLogs: errors-only
# [ ] --ouptut-logs=errors-only
  $ ${NRZ} run builderror2
  \xe2\x80\xa2 Packages in scope: app-a (esc)
  \xe2\x80\xa2 Running builderror2 in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  app-a:builderror2: cache miss, executing c9a24c574d465f79
  app-a:builderror2: 
  app-a:builderror2: > builderror2
  app-a:builderror2: > echo error-builderror2-app-a && exit 1
  app-a:builderror2: 
  app-a:builderror2: error-builderror2-app-a
  app-a:builderror2: npm error Lifecycle script `builderror2` failed with error:
  app-a:builderror2: npm error code 1
  app-a:builderror2: npm error path /tmp/prysk-tests-eir4a5ob/errors-only.t/app-a
  app-a:builderror2: npm error workspace app-a
  app-a:builderror2: npm error location /tmp/prysk-tests-eir4a5ob/errors-only.t/app-a
  app-a:builderror2: npm error command failed
  app-a:builderror2: npm error command bash -c echo error-builderror2-app-a && exit 1
  app-a:builderror2: ERROR: command finished with error: command (/tmp/prysk-tests-eir4a5ob/errors-only.t/app-a) /home/gitpod/.nvm/versions/node/v22.11.0/bin/npm run builderror2 exited (1)
  app-a#builderror2: command (/tmp/prysk-tests-eir4a5ob/errors-only.t/app-a) /home/gitpod/.nvm/versions/node/v22.11.0/bin/npm run builderror2 exited (1)
  
   Tasks:    0 successful, 1 total
  Cached:    0 cached, 1 total
    Time:\s*[\.0-9]+m?s  (re)
  Failed:    app-a#builderror2
  
   ERROR  run failed: command  exited (1)
  [1]




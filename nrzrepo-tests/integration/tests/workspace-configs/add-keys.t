Setup
  $ . ${TESTDIR}/../../../helpers/setup_integration_test.sh composable_config

# The add-keys-task in the root nrz.json has no config. This test:
# [x] Tests dependsOn works by asserting that another task runs first
# [x] Tests outputs works by asserting that the right directory is cached
# [x] Tests outputLogs by asserting output logs on a second run
# [x] Tests inputs works by changing a file and testing there was a cache miss
# [x] Tests env works by setting an env var and asserting there was a cache miss

# 1. First run, assert for `dependsOn` and `outputs` keys
  $ ${NRZ} run add-keys-task --filter=add-keys > tmp.log
  $ cat tmp.log
  \xe2\x80\xa2 Packages in scope: add-keys (esc)
  \xe2\x80\xa2 Running add-keys-task in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  add-keys:add-keys-underlying-task: cache miss, executing 6798fd639142a6c0
  add-keys:add-keys-underlying-task: 
  add-keys:add-keys-underlying-task: > add-keys-underlying-task
  add-keys:add-keys-underlying-task: > echo running-add-keys-underlying-task
  add-keys:add-keys-underlying-task: 
  add-keys:add-keys-underlying-task: running-add-keys-underlying-task
  add-keys:add-keys-task: cache miss, executing 67daa486e07a0d92
  add-keys:add-keys-task: 
  add-keys:add-keys-task: > add-keys-task
  add-keys:add-keys-task: > echo running-add-keys-task > out/foo.min.txt
  add-keys:add-keys-task: 
  
   Tasks:    2 successful, 2 total
  Cached:    0 cached, 2 total
    Time:\s*[\.0-9]+m?s  (re)
  
  $ HASH=$(cat tmp.log | grep -E "add-keys:add-keys-task.* executing .*" | awk '{print $5}')
  $ tar -tf $TARGET_DIR/.nrz/cache/$HASH.tar.zst;
  tar (child): zstd: Cannot exec: No such file or directory
  tar (child): Error is not recoverable: exiting now
  tar: Child returned status 2
  tar: Error is not recoverable: exiting now
  [2]

# 2. Second run, test there was a cache hit (`cache` config`) and `output` was suppressed (`outputLogs`)
  $ ${NRZ} run add-keys-task --filter=add-keys
  \xe2\x80\xa2 Packages in scope: add-keys (esc)
  \xe2\x80\xa2 Running add-keys-task in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  add-keys:add-keys-underlying-task: cache hit, replaying logs 6798fd639142a6c0
  add-keys:add-keys-underlying-task: 
  add-keys:add-keys-underlying-task: > add-keys-underlying-task
  add-keys:add-keys-underlying-task: > echo running-add-keys-underlying-task
  add-keys:add-keys-underlying-task: 
  add-keys:add-keys-underlying-task: running-add-keys-underlying-task
  add-keys:add-keys-task: cache hit, suppressing logs 67daa486e07a0d92
  
   Tasks:    2 successful, 2 total
  Cached:    2 cached, 2 total
    Time:\s*[\.0-9]+m?s >>> FULL NRZ (re)
  
# 3. Change input file and assert cache miss
  $ echo "more text" >> $TARGET_DIR/apps/add-keys/src/foo.txt
  $ ${NRZ} run add-keys-task --filter=add-keys
  \xe2\x80\xa2 Packages in scope: add-keys (esc)
  \xe2\x80\xa2 Running add-keys-task in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  add-keys:add-keys-underlying-task: cache miss, executing 5d41b990809ac700
  add-keys:add-keys-underlying-task: 
  add-keys:add-keys-underlying-task: > add-keys-underlying-task
  add-keys:add-keys-underlying-task: > echo running-add-keys-underlying-task
  add-keys:add-keys-underlying-task: 
  add-keys:add-keys-underlying-task: running-add-keys-underlying-task
  add-keys:add-keys-task: cache miss, executing b9b5387ad39e296b
  add-keys:add-keys-task: 
  add-keys:add-keys-task: > add-keys-task
  add-keys:add-keys-task: > echo running-add-keys-task > out/foo.min.txt
  add-keys:add-keys-task: 
  
   Tasks:    2 successful, 2 total
  Cached:    0 cached, 2 total
    Time:\s*[\.0-9]+m?s  (re)
  
# 4. Set env var and assert cache miss
  $ SOME_VAR=somevalue ${NRZ} run add-keys-task --filter=add-keys
  \xe2\x80\xa2 Packages in scope: add-keys (esc)
  \xe2\x80\xa2 Running add-keys-task in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  add-keys:add-keys-underlying-task: cache hit, replaying logs 5d41b990809ac700
  add-keys:add-keys-underlying-task: 
  add-keys:add-keys-underlying-task: > add-keys-underlying-task
  add-keys:add-keys-underlying-task: > echo running-add-keys-underlying-task
  add-keys:add-keys-underlying-task: 
  add-keys:add-keys-underlying-task: running-add-keys-underlying-task
  add-keys:add-keys-task: cache miss, executing 741f771fe312a2cf
  add-keys:add-keys-task: 
  add-keys:add-keys-task: > add-keys-task
  add-keys:add-keys-task: > echo running-add-keys-task > out/foo.min.txt
  add-keys:add-keys-task: 
  
   Tasks:    2 successful, 2 total
  Cached:    1 cached, 2 total
    Time:\s*[\.0-9]+m?s  (re)
  

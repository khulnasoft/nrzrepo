Setup
  $ . ${TESTDIR}/../../../helpers/setup_integration_test.sh composable_config

# The missing-workspace-config-task task in the root nrz.json has config. The workspace config
# does not have a nrz.json. The tests below use `missing-workspace-config-task` to assert that:
# - `outputs`, `inputs`, `env` are retained from the root.

# 1. First run, assert for `outputs`
  $ ${NRZ} run missing-workspace-config-task --filter=missing-workspace-config > tmp.log
  $ cat tmp.log
  \xe2\x80\xa2 Packages in scope: missing-workspace-config (esc)
  \xe2\x80\xa2 Running missing-workspace-config-task in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  missing-workspace-config:missing-workspace-config-task: cache miss, executing 41286ef3591f21e3
  missing-workspace-config:missing-workspace-config-task: 
  missing-workspace-config:missing-workspace-config-task: > missing-workspace-config-task
  missing-workspace-config:missing-workspace-config-task: > echo running-missing-workspace-config-task > out/foo.min.txt
  missing-workspace-config:missing-workspace-config-task: 
  
   Tasks:    1 successful, 1 total
  Cached:    0 cached, 1 total
    Time:\s*[\.0-9]+m?s  (re)
  
  $ HASH=$(cat tmp.log | grep -E "missing-workspace-config:missing-workspace-config-task.* executing .*" | awk '{print $5}')
  $ tar -tf $TARGET_DIR/.nrz/cache/$HASH.tar.zst;
  tar (child): zstd: Cannot exec: No such file or directory
  tar (child): Error is not recoverable: exiting now
  tar: Child returned status 2
  tar: Error is not recoverable: exiting now
  [2]

2. Run again and assert cache hit, and that output is suppressed
  $ ${NRZ} run missing-workspace-config-task --filter=missing-workspace-config
  \xe2\x80\xa2 Packages in scope: missing-workspace-config (esc)
  \xe2\x80\xa2 Running missing-workspace-config-task in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  missing-workspace-config:missing-workspace-config-task: cache hit, suppressing logs 41286ef3591f21e3
  
   Tasks:    1 successful, 1 total
  Cached:    1 cached, 1 total
    Time:\s*[\.0-9]+m?s >>> FULL NRZ (re)
  
3. Change input file and assert cache miss, and not FULL NRZ
  $ echo "more text" >> $TARGET_DIR/apps/missing-workspace-config/src/foo.txt
  $ ${NRZ} run missing-workspace-config-task --filter=missing-workspace-config
  \xe2\x80\xa2 Packages in scope: missing-workspace-config (esc)
  \xe2\x80\xa2 Running missing-workspace-config-task in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  missing-workspace-config:missing-workspace-config-task: cache miss, executing 5881df131955d6c3
  missing-workspace-config:missing-workspace-config-task: 
  missing-workspace-config:missing-workspace-config-task: > missing-workspace-config-task
  missing-workspace-config:missing-workspace-config-task: > echo running-missing-workspace-config-task > out/foo.min.txt
  missing-workspace-config:missing-workspace-config-task: 
  
   Tasks:    1 successful, 1 total
  Cached:    0 cached, 1 total
    Time:\s*[\.0-9]+m?s  (re)
  

3a. Changing a different file (that is not in `inputs` config) gets cache hit and FULL NRZ
  $ echo "more text" >> $TARGET_DIR/apps/missing-workspace-config/src/bar.txt
  $ ${NRZ} run missing-workspace-config-task --filter=missing-workspace-config
  \xe2\x80\xa2 Packages in scope: missing-workspace-config (esc)
  \xe2\x80\xa2 Running missing-workspace-config-task in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  missing-workspace-config:missing-workspace-config-task: cache hit, suppressing logs 5881df131955d6c3
  
   Tasks:    1 successful, 1 total
  Cached:    1 cached, 1 total
    Time:\s*[\.0-9]+m?s >>> FULL NRZ (re)
  
4. Set env var and assert cache miss, and that hash is different from above
  $ SOME_VAR=somevalue ${NRZ} run missing-workspace-config-task --filter=missing-workspace-config
  \xe2\x80\xa2 Packages in scope: missing-workspace-config (esc)
  \xe2\x80\xa2 Running missing-workspace-config-task in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  missing-workspace-config:missing-workspace-config-task: cache miss, executing 19b702832e1e633c
  missing-workspace-config:missing-workspace-config-task: 
  missing-workspace-config:missing-workspace-config-task: > missing-workspace-config-task
  missing-workspace-config:missing-workspace-config-task: > echo running-missing-workspace-config-task > out/foo.min.txt
  missing-workspace-config:missing-workspace-config-task: 
  
   Tasks:    1 successful, 1 total
  Cached:    0 cached, 1 total
    Time:\s*[\.0-9]+m?s  (re)
  
5. Assert that task with cache:false doesn't get cached
  $ ${NRZ} run cached-task-4 --filter=missing-workspace-config > tmp.log
  $ cat tmp.log
  \xe2\x80\xa2 Packages in scope: missing-workspace-config (esc)
  \xe2\x80\xa2 Running cached-task-4 in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  missing-workspace-config:cached-task-4: cache bypass, force executing 3b7b2135bd1ec792
  missing-workspace-config:cached-task-4: 
  missing-workspace-config:cached-task-4: > cached-task-4
  missing-workspace-config:cached-task-4: > echo cached-task-4 > out/foo.min.txt
  missing-workspace-config:cached-task-4: 
  
   Tasks:    1 successful, 1 total
  Cached:    0 cached, 1 total
    Time:\s*[\.0-9]+m?s  (re)
  
  $ HASH=$(cat tmp.log | grep -E "missing-workspace-config:cached-task-4.* executing .*" | awk '{print $6}')
  $ echo $HASH
  [a-z0-9]{16} (re)
  $ test -f $TARGET_DIR/.nrz/cache/$HASH.tar.zst;
  [1]

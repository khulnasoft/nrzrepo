Setup
  $ . ${TESTDIR}/../../../../helpers/setup_integration_test.sh single_package "yarn@1.22.17"

Check
  $ ${NRZ} run build
  \xe2\x80\xa2 Running build (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  build: cache miss, executing 94eed1e1fbe6eec9
  build: yarn run v1.22.17
  build: warning package.json: No license field
  build: $ echo building > foo.txt
  build: Done in \s*[\.0-9]+m?s\. (re)
  
   Tasks:    1 successful, 1 total
  Cached:    0 cached, 1 total
    Time:\s*[\.0-9]+m?s  (re)
  
  $ ${NRZ} run build
  \xe2\x80\xa2 Running build (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  build: cache hit, replaying logs 94eed1e1fbe6eec9
  build: yarn run v1.22.17
  build: warning package.json: No license field
  build: $ echo building > foo.txt
  build: Done in \s*[\.0-9]+m?s\. (re)
  
   Tasks:    1 successful, 1 total
  Cached:    1 cached, 1 total
    Time:\s*[\.0-9]+m?s >>> FULL NRZ (re)
  

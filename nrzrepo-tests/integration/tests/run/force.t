Setup
  $ . ${TESTDIR}/../../../helpers/setup_integration_test.sh

# Tests
| env var | flag    | bypass? |
| ------- | ------- | ------- |
| true    | missing | yes     |
| true    | true    | yes     |
| true    | false   | no      |
| true    | novalue | yes     |

| false   | missing | no      |
| false   | true    | yes     |
| false   | false   | no      |
| false   | novalue | yes     |

| missing | missing | no      |
| missing | true    | yes     |
| missing | false   | no      |
| missing | novalue | yes     |

baseline to generate cache
  $ ${NRZ} run build --output-logs=hash-only --filter=my-app
  \xe2\x80\xa2 Packages in scope: my-app (esc)
  \xe2\x80\xa2 Running build in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  my-app:build: cache miss, executing 6d66bca0a23c3667
  
   Tasks:    1 successful, 1 total
  Cached:    0 cached, 1 total
    Time:\s*[\.0-9]+m?s  (re)
  
   WARNING  no output files found for task my-app#build. Please check your `outputs` key in `nrz.json`

# env var=true, missing flag: cache bypass
  $ NRZ_FORCE=true ${NRZ} run build --output-logs=hash-only --filter=my-app
  \xe2\x80\xa2 Packages in scope: my-app (esc)
  \xe2\x80\xa2 Running build in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  my-app:build: cache bypass, force executing 6d66bca0a23c3667
  
   Tasks:    1 successful, 1 total
  Cached:    0 cached, 1 total
    Time:\s*[\.0-9]+m?s  (re)
  
   WARNING  no output files found for task my-app#build. Please check your `outputs` key in `nrz.json`
# env var=true, --flag=true: cache bypass
  $ NRZ_FORCE=true ${NRZ} run build --output-logs=hash-only --filter=my-app --force=true
  \xe2\x80\xa2 Packages in scope: my-app (esc)
  \xe2\x80\xa2 Running build in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  my-app:build: cache bypass, force executing 6d66bca0a23c3667
  
   Tasks:    1 successful, 1 total
  Cached:    0 cached, 1 total
    Time:\s*[\.0-9]+m?s  (re)
  
   WARNING  no output files found for task my-app#build. Please check your `outputs` key in `nrz.json`
# env var=true, --flag=false: cache hit
  $ NRZ_FORCE=true ${NRZ} run build --output-logs=hash-only --filter=my-app --force=false
  \xe2\x80\xa2 Packages in scope: my-app (esc)
  \xe2\x80\xa2 Running build in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  my-app:build: cache hit, suppressing logs 6d66bca0a23c3667
  
   Tasks:    1 successful, 1 total
  Cached:    1 cached, 1 total
    Time:\s*[\.0-9]+m?s >>> FULL NRZ (re)
  
# env var=true, --flag (no value): cache bypass
  $ NRZ_FORCE=true ${NRZ} run build --output-logs=hash-only --filter=my-app --force
  \xe2\x80\xa2 Packages in scope: my-app (esc)
  \xe2\x80\xa2 Running build in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  my-app:build: cache bypass, force executing 6d66bca0a23c3667
  
   Tasks:    1 successful, 1 total
  Cached:    0 cached, 1 total
    Time:\s*[\.0-9]+m?s  (re)
  
   WARNING  no output files found for task my-app#build. Please check your `outputs` key in `nrz.json`

# env var=false, missing flag, cache hit
  $ NRZ_FORCE=false ${NRZ} run build --output-logs=hash-only --filter=my-app
  \xe2\x80\xa2 Packages in scope: my-app (esc)
  \xe2\x80\xa2 Running build in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  my-app:build: cache hit, suppressing logs 6d66bca0a23c3667
  
   Tasks:    1 successful, 1 total
  Cached:    1 cached, 1 total
    Time:\s*[\.0-9]+m?s >>> FULL NRZ (re)
  
# env var=false, --flag=true: cache bypass
  $ NRZ_FORCE=false ${NRZ} run build --output-logs=hash-only --filter=my-app --force=true
  \xe2\x80\xa2 Packages in scope: my-app (esc)
  \xe2\x80\xa2 Running build in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  my-app:build: cache bypass, force executing 6d66bca0a23c3667
  
   Tasks:    1 successful, 1 total
  Cached:    0 cached, 1 total
    Time:\s*[\.0-9]+m?s  (re)
  
   WARNING  no output files found for task my-app#build. Please check your `outputs` key in `nrz.json`
# env var=false, --flag=false: cache hit
  $ NRZ_FORCE=false ${NRZ} run build --output-logs=hash-only --filter=my-app --force=false
  \xe2\x80\xa2 Packages in scope: my-app (esc)
  \xe2\x80\xa2 Running build in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  my-app:build: cache hit, suppressing logs 6d66bca0a23c3667
  
   Tasks:    1 successful, 1 total
  Cached:    1 cached, 1 total
    Time:\s*[\.0-9]+m?s >>> FULL NRZ (re)
  
# env var=false, --flag (no value): cache bypass
  $ NRZ_FORCE=false ${NRZ} run build --output-logs=hash-only --filter=my-app --force
  \xe2\x80\xa2 Packages in scope: my-app (esc)
  \xe2\x80\xa2 Running build in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  my-app:build: cache bypass, force executing 6d66bca0a23c3667
  
   Tasks:    1 successful, 1 total
  Cached:    0 cached, 1 total
    Time:\s*[\.0-9]+m?s  (re)
  
   WARNING  no output files found for task my-app#build. Please check your `outputs` key in `nrz.json`

# missing env var, missing flag: cache hit
  $ ${NRZ} run build --output-logs=hash-only --filter=my-app
  \xe2\x80\xa2 Packages in scope: my-app (esc)
  \xe2\x80\xa2 Running build in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  my-app:build: cache hit, suppressing logs 6d66bca0a23c3667
  
   Tasks:    1 successful, 1 total
  Cached:    1 cached, 1 total
    Time:\s*[\.0-9]+m?s >>> FULL NRZ (re)
  
# missing env var, --flag=true: cache bypass
  $ ${NRZ} run build --output-logs=hash-only --filter=my-app --force=true
  \xe2\x80\xa2 Packages in scope: my-app (esc)
  \xe2\x80\xa2 Running build in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  my-app:build: cache bypass, force executing 6d66bca0a23c3667
  
   Tasks:    1 successful, 1 total
  Cached:    0 cached, 1 total
    Time:\s*[\.0-9]+m?s  (re)
  
   WARNING  no output files found for task my-app#build. Please check your `outputs` key in `nrz.json`
# missing env var, --flag=false: cache hit
  $ ${NRZ} run build --output-logs=hash-only --filter=my-app --force=false
  \xe2\x80\xa2 Packages in scope: my-app (esc)
  \xe2\x80\xa2 Running build in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  my-app:build: cache hit, suppressing logs 6d66bca0a23c3667
  
   Tasks:    1 successful, 1 total
  Cached:    1 cached, 1 total
    Time:\s*[\.0-9]+m?s >>> FULL NRZ (re)
  
# missing env var, --flag (no value): cache bypass
  $ ${NRZ} run build --output-logs=hash-only --filter=my-app --force
  \xe2\x80\xa2 Packages in scope: my-app (esc)
  \xe2\x80\xa2 Running build in 1 packages (esc)
  \xe2\x80\xa2 Remote caching disabled (esc)
  my-app:build: cache bypass, force executing 6d66bca0a23c3667
  
   Tasks:    1 successful, 1 total
  Cached:    0 cached, 1 total
    Time:\s*[\.0-9]+m?s  (re)
  
   WARNING  no output files found for task my-app#build. Please check your `outputs` key in `nrz.json`

Setup
  $ . ${TESTDIR}/../../helpers/setup_integration_test.sh
  $ . ${TESTDIR}/../../helpers/replace_nrz_json.sh $(pwd) "interactive.json"
Verify we error on interactive task that hasn't been marked as cache: false
  $ ${NRZ} build
    x Tasks cannot be marked as interactive and cacheable.
     ,-[nrz.json:6:1]
   6 |     "build": {
   7 |       "interactive": true
     :                      ^^|^
     :                        `-- marked interactive here
   8 |     }
     `----
  
  [1]

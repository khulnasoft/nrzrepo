Setup
  $ . ${TESTDIR}/../../../helpers/setup_integration_test.sh
 
Run a dry run
  $ ${NRZ} build --dry=json | jq .packages
  [
    "another",
    "my-app",
    "util"
  ]

Run a dry run in packages with a glob filter
  $ ${NRZ} build --dry=json -F "./packages/*" | jq .packages
  [
    "another",
    "util"
  ]

Run a dry run in packages with a name glob
  $ ${NRZ} build --dry=json -F "*-app" | jq .packages
  [
    "my-app"
  ]

Run a dry run in packages with a filter
  $ cd packages
  $ ${NRZ} build --dry=json -F "{./util}" | jq .packages
  [
    "util"
  ]
Run a dry run with a filter from a sibling directory
  $ ${NRZ} build --dry=json -F "../apps/*" | jq .packages
  [
    "my-app"
  ]

Run a dry run with a filter name glob
  $ ${NRZ} build --dry=json -F "*-app" | jq .packages
  [
    "my-app"
  ]

Run a dry run in a directory
  $ cd util
  $ ${NRZ} build --dry=json | jq .packages
  [
    "util"
  ]

Ensure we don't infer packages if --cwd is supplied
  $ ${NRZ} build --cwd=../.. --dry=json | jq .packages
  [
    "another",
    "my-app",
    "util"
  ]

Run a dry run in packages with a glob filter from directory
  $ ${NRZ} build --dry=json -F "../*" | jq .packages
  [
    "util"
  ]

Run a dry run in packages with a name glob from directory
  $ ${NRZ} build --dry=json -F "*nother" | jq .packages
  [
    "another"
  ]

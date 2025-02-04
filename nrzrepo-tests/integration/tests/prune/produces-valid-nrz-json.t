Setup
  $ . ${TESTDIR}/../../../helpers/setup_integration_test.sh monorepo_with_root_dep pnpm@7.25.1

Make sure that the internal util package is part of the prune output
  $ ${NRZ} prune docs
  Generating pruned monorepo for docs in .*(\/|\\)out (re)
   - Added docs
   - Added shared
   - Added util

Make sure we prune tasks that reference a pruned workspace
  $ cat out/nrz.json | jq
  {
    "$schema": "https://turbo.build/schema.json",
    "tasks": {
      "build": {
        "outputs": []
      }
    },
    "ui": "stream"
  }

Verify nrz can read the produced nrz.json
  $ cd out
  $ ${NRZ} build --dry=json | jq '.packages'
  [
    "docs",
    "shared",
    "util"
  ]

Modify nrz.json to add some fields to remoteCache and add a spaceId
  $ rm -rf out
  $ cat nrz.json | jq '.remoteCache.enabled = true | .remoteCache.timeout = 1000 | .remoteCache.apiUrl = "my-domain.com/cache" | .experimentalSpaces.id = "my-space-id"' > nrz.json.tmp
  $ mv nrz.json.tmp nrz.json
  $ ${NRZ} prune docs > /dev/null
  $ cat out/nrz.json | jq '.remoteCache | keys'
  [
    "apiUrl",
    "enabled",
    "timeout"
  ]
  $ cat out/nrz.json | jq '.remoteCache.enabled'
  true
  $ cat out/nrz.json | jq '.experimentalSpaces.id'
  "my-space-id"
  $ cat out/nrz.json | jq '.remoteCache.timeout'
  1000
  $ cat out/nrz.json | jq '.remoteCache.apiUrl'
  "my-domain.com/cache"

Modify nrz.json to add a remoteCache.enabled field set to false
  $ rm -rf out
  $ cat nrz.json | jq '.remoteCache.enabled = false' > nrz.json.tmp
  $ mv nrz.json.tmp nrz.json
  $ ${NRZ} prune docs > /dev/null
  $ cat out/nrz.json | jq '.remoteCache | keys'
  [
    "apiUrl",
    "enabled",
    "timeout"
  ]
  $ cat out/nrz.json | jq '.remoteCache.enabled'
  false

Setup
  $ . ${TESTDIR}/../../helpers/setup_integration_test.sh
  $ jq '.engines = {"node": ">=12"}' package.json > package.json.new
  $ mv package.json.new package.json

Check a hash
  $ ${NRZ} build --dry=json --filter=my-app | jq '.tasks | last | .hash'
  "03862aca6b444a20"
Change engines
  $ jq '.engines = {"node": ">=16"}' package.json > package.json.new
  $ mv package.json.new package.json

Verify hash has changed
  $ ${NRZ} build --dry=json --filter=my-app | jq ".tasks | last | .hash"
  "fb849f5ad08ef9eb"

Verify engines are part of global cache inputs
  $ ${NRZ} build --dry=json | jq '.globalCacheInputs.engines'
  {
    "node": ">=16"
  }

Setup
  $ . ${TESTDIR}/../../helpers/setup_integration_test.sh
  $ . ${TESTDIR}/../../helpers/replace_nrz_json.sh $(pwd) spaces-failure.json

Ensures that even when spaces fails, the build still succeeds.
  $ ${NRZ} run build --token foobarbaz --team bat --api https://example.com > /dev/null 2>&1

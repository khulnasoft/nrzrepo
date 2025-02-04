Setup
  $ . ${TESTDIR}/../../../helpers/setup_integration_test.sh composable_config

# 1. First run, check the hash
  $ ${NRZ} run config-change-task --filter=config-change --dry=json | jq .tasks[0].hash
  "52c825f2de902cba"

2. Run again and assert task hash stays the same
  $ ${NRZ} run config-change-task --filter=config-change --dry=json | jq .tasks[0].hash
  "52c825f2de902cba"

3. Change nrz.json and assert that hash changes
  $ cp $TARGET_DIR/apps/config-change/nrz-changed.json $TARGET_DIR/apps/config-change/nrz.json
  $ ${NRZ} run config-change-task --filter=config-change --dry=json | jq .tasks[0].hash
  "0d951b05e31fee97"

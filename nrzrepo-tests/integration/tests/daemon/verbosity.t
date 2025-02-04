Setup
  $ . ${TESTDIR}/../../../helpers/setup_integration_test.sh

NRZ_LOG_VERBOSITY should be respected
  $ NRZ_LOG_VERBOSITY=debug ${NRZ} daemon status > tmp.log 2>&1
  $ grep --quiet -E "\[DEBUG].*" tmp.log
  $ grep --quiet "x daemon is not running, run \`nrz daemon start\` to start it" tmp.log

-v flag overrides NRZ_LOG_VERBOSITY global setting
  $ NRZ_LOG_VERBOSITY=debug ${NRZ} daemon status -v > tmp.log 2>&1
  $ grep --quiet -E "\[DEBUG].*" tmp.log # DEBUG logs not found
  [1]
  $ grep --quiet "x daemon is not running, run \`nrz daemon start\` to start it" tmp.log

verbosity doesn't override NRZ_LOG_VERBOSITY package settings
  $ NRZ_LOG_VERBOSITY=nrzrepo_lib=debug ${NRZ} daemon status -v > tmp.log 2>&1
  $ grep --quiet -E "\[DEBUG].*" tmp.log
  $ grep --quiet "x daemon is not running, run \`nrz daemon start\` to start it" tmp.log

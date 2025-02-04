Setup
  $ . ${TESTDIR}/../../../helpers/setup_integration_test.sh strict_env_vars

With --env-mode (should be the same as --env-mode=infer)

Baseline global hash
  $ BASELINE=$(${NRZ} build -vv 2>&1 | "$TESTDIR/../../../helpers/find_global_hash.sh")

There's no config to start, so the global hash does not change when flag is passed
  $ WITH_FLAG=$(${NRZ} build -vv --env-mode 2>&1 | "$TESTDIR/../../../helpers/find_global_hash.sh")
  $ test $BASELINE = $WITH_FLAG

Add empty config for global pass through env var, global hash changes
  $ ${TESTDIR}/../../../helpers/replace_nrz_json.sh $(pwd) "strict_env_vars/global_pt-empty.json"
  $ WITH_EMPTY_GLOBAL=$(${NRZ} build -vv --env-mode 2>&1 | "$TESTDIR/../../../helpers/find_global_hash.sh")
  $ test $BASELINE != $WITH_EMPTY_GLOBAL

Add global pass through env var, global hash changes again, because we changed the value
  $ ${TESTDIR}/../../../helpers/replace_nrz_json.sh $(pwd) "strict_env_vars/global_pt.json"
  $ WITH_GLOBAL=$(${NRZ} build -vv --env-mode 2>&1 | "$TESTDIR/../../../helpers/find_global_hash.sh")
  $ test $WITH_EMPTY_GLOBAL != $WITH_GLOBAL

Setup
  $ . ${TESTDIR}/../../../helpers/setup_integration_test.sh strict_env_vars

With --env-mode=loose

Baseline global hash
  $ BASELINE=$(${NRZ} build -vv 2>&1 | "$TESTDIR/../../../helpers/find_global_hash.sh")

Hash changes, because we're using a new mode
  $ WITH_FLAG=$(${NRZ} build -vv --env-mode=loose 2>&1 | "$TESTDIR/../../../helpers/find_global_hash.sh")
  $ test $BASELINE != $WITH_FLAG

Add empty config for global pass through env var
Hash does not change, because in loose mode, we don't care what the actual config contains
  $ ${TESTDIR}/../../../helpers/replace_nrz_json.sh $(pwd) "strict_env_vars/global_pt-empty.json"
  $ WITH_EMPTY_GLOBAL=$(${NRZ} build -vv --env-mode=loose 2>&1 | "$TESTDIR/../../../helpers/find_global_hash.sh")
  $ test $WITH_FLAG = $WITH_EMPTY_GLOBAL

Add global pass through env var
Hash does not change, because in loose mode, we don't care what the actual config contains
  $ ${TESTDIR}/../../../helpers/replace_nrz_json.sh $(pwd) "strict_env_vars/global_pt.json"
  $ WITH_GLOBAL=$(${NRZ} build -vv --env-mode=loose 2>&1 | "$TESTDIR/../../../helpers/find_global_hash.sh")
  $ test $WITH_FLAG = $WITH_GLOBAL
  $ test $WITH_EMPTY_GLOBAL = $WITH_GLOBAL

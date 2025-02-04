  $ . ${TESTDIR}/../../helpers/setup.sh

Make sure exit code is 2 when no args are passed
  $ CURR=$(${NRZ} --cwd ${TESTDIR}/../.. bin)
  $ diff --strip-trailing-cr <(readlink -f ${NRZ}) <(readlink -f ${CURR})


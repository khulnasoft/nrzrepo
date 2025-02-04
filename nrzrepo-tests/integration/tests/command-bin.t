Setup
  $ . ${TESTDIR}/../../helpers/setup_integration_test.sh

  $ ${NRZ} bin -vvv > out.log 2>&1
  $ grep --quiet "Global nrz version: .*" out.log
  $ grep --quiet "No local nrz binary found at" out.log
  $ grep --quiet "Running command as global nrz" out.log
  $ grep --quiet -E ".*[\/\\]target[\/\\]debug[\/\\]nrz(\.exe)?$" out.log

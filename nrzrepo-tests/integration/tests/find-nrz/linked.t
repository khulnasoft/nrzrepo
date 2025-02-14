Setup
  $ . ${TESTDIR}/../../../helpers/setup.sh
  $ . ${TESTDIR}/setup.sh $(pwd) "linked"

Make sure we use local, but do not pass --skip-infer to old binary
  $ ${TESTDIR}/set_version.sh $(pwd) "1.0.0"
  $ ${NRZ} build --filter foo -vv > out.log 2>&1
  [1]
  $ grep --quiet -F "Local nrz version: 1.0.0" out.log
  [1]
  $ cat out.log | tail -n1
  

Make sure we use local, and DO pass --skip-infer to newer binary
  $ ${TESTDIR}/set_version.sh $(pwd) "1.8.0"
  $ ${NRZ} build --filter foo -vv > out.log 2>&1
  [1]
  $ grep --quiet -F "Local nrz version: 1.8.0" out.log
  [1]
  $ cat out.log | tail -n1
  

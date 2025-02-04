Setup
  $ . ${TESTDIR}/../../../helpers/setup.sh
  $ . ${TESTDIR}/setup.sh $(pwd) "self"

Make sure we do not reinvoke ourself.
  $ ${TESTDIR}/set_link.sh $(pwd) ${NRZ}
  $ ${NRZ} --version -vv > out.log 2>&1
  $ grep --quiet -F "Currently running nrz is local nrz" out.log

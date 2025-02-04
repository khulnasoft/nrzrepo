Setup
  $ . ${TESTDIR}/../../helpers/setup.sh
  $ VERSION=${MONOREPO_ROOT_DIR}/version.txt

Test version matches that of version.txt
  $ diff --strip-trailing-cr <(head -n 1 ${VERSION}) <(${NRZ} --version)


TODO: resolve ambiguity
  $ ${NRZ} -v
    x No command specified.
  
  [1]

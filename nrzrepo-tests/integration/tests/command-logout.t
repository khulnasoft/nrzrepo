Setup
  $ . ${TESTDIR}/../../helpers/setup.sh
  $ . ${TESTDIR}/../../helpers/mock_nrz_config.sh

Logout while logged in
  $ ${NRZ} logout
  >>> Logged out

Logout while logged out
  $ ${NRZ} logout
  >>> Logged out


Setup
  $ . ${TESTDIR}/../../../helpers/setup_integration_test.sh

Run build and record a trace
Ignore output since we want to focus on testing the generated profile
  $ ${NRZ} build --profile=build.trace > nrz.log
   WARNING  no output files found for task my-app#build. Please check your `outputs` key in `nrz.json`
Make sure the resulting trace is valid JSON
  $ node -e "require('./build.trace')"

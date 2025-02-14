  $ . ${TESTDIR}/../../../helpers/setup_integration_test.sh "with-pkg-deps"
  $ source "$TESTDIR/../../../helpers/run_summary.sh"

  $ rm -rf .nrz/runs
  $ git commit --quiet -am "new sha" --allow-empty && ${NRZ} run build --summarize > /dev/null 2>&1
  $ SUMMARY=$(/bin/ls .nrz/runs/*.json | head -n1)
  $ getSummaryTaskId $SUMMARY "my-app#build" | jq .dependencies
  [
    "another#build",
    "util#build"
  ]

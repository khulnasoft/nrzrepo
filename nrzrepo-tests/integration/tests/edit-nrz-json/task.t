Setup
  $ . ${TESTDIR}/../../../helpers/setup_integration_test.sh

Baseline task hashes
  $ cp "$TESTDIR/fixture-configs/a-baseline.json" "$(pwd)/nrz.json" && git commit -am "no comment" --quiet
  $ ${NRZ} build --dry=json | jq -r '.tasks | sort_by(.taskId)[] | {taskId, hash}'
  {
    "taskId": "another#build",
    "hash": "377cb55d11715a40"
  }
  {
    "taskId": "my-app#build",
    "hash": "6d66bca0a23c3667"
  }
  {
    "taskId": "util#build",
    "hash": "a058f1b9780e098d"
  }

Change only my-app#build
  $ cp "$TESTDIR/fixture-configs/b-change-only-my-app.json" "$(pwd)/nrz.json" && git commit -am "no comment" --quiet
  $ ${NRZ} build --dry=json | jq -r '.tasks | sort_by(.taskId)[] | {taskId, hash}'
  {
    "taskId": "another#build",
    "hash": "377cb55d11715a40"
  }
  {
    "taskId": "my-app#build",
    "hash": "0c71a1de71b9c7ac"
  }
  {
    "taskId": "util#build",
    "hash": "a058f1b9780e098d"
  }

Change my-app#build dependsOn
  $ cp "$TESTDIR/fixture-configs/c-my-app-depends-on.json" "$(pwd)/nrz.json" && git commit -am "no comment" --quiet
  $ ${NRZ} build --dry=json | jq -r '.tasks | sort_by(.taskId)[] | {taskId, hash}'
  {
    "taskId": "another#build",
    "hash": "377cb55d11715a40"
  }
  {
    "taskId": "my-app#build",
    "hash": "411b4d59fb1a5a5d"
  }
  {
    "taskId": "util#build",
    "hash": "a058f1b9780e098d"
  }

Non-materially modifying the dep graph does nothing.
  $ cp "$TESTDIR/fixture-configs/d-depends-on-util.json" "$(pwd)/nrz.json" && git commit -am "no comment" --quiet
  $ ${NRZ} build --dry=json | jq -r '.tasks | sort_by(.taskId)[] | {taskId, hash}'
  {
    "taskId": "another#build",
    "hash": "377cb55d11715a40"
  }
  {
    "taskId": "my-app#build",
    "hash": "411b4d59fb1a5a5d"
  }
  {
    "taskId": "util#build",
    "hash": "a058f1b9780e098d"
  }


Change util#build impacts itself and my-app
  $ cp "$TESTDIR/fixture-configs/e-depends-on-util-but-modified.json" "$(pwd)/nrz.json" && git commit -am "no comment" --quiet
  $ ${NRZ} build --dry=json | jq -r '.tasks | sort_by(.taskId)[] | {taskId, hash}'
  {
    "taskId": "another#build",
    "hash": "377cb55d11715a40"
  }
  {
    "taskId": "my-app#build",
    "hash": "2608129ceb108f79"
  }
  {
    "taskId": "util#build",
    "hash": "a43ed383f8e93f66"
  }

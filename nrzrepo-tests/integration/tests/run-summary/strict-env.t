Setup
  $ . ${TESTDIR}/../../../helpers/setup_integration_test.sh strict_env_vars

Set the env vars
  $ export GLOBAL_VAR_PT=higlobalpt
  $ export GLOBAL_VAR_DEP=higlobaldep
  $ export LOCAL_VAR_PT=hilocalpt
  $ export LOCAL_VAR_DEP=hilocaldep
  $ export OTHER_VAR=hiother
  $ export SYSTEMROOT=hisysroot

Run as `infer`
  $ rm -rf .nrz/runs
  $ ${NRZ} run build --summarize > /dev/null
   WARNING  no output files found for task my-app#build. Please check your `outputs` key in `nrz.json`
  $ cat .nrz/runs/*.json | jq -r '.envMode'
  strict
  $ cat .nrz/runs/*.json | jq -r '.tasks[0].envMode'
  strict
  $ cat .nrz/runs/*.json | jq -r '.tasks[0].environmentVariables | {passthrough, globalPassthrough}'
  {
    "passthrough": null,
    "globalPassthrough": null
  }

Run as `strict`
  $ rm -rf .nrz/runs
  $ ${NRZ} run build --env-mode=strict --summarize > /dev/null
  $ cat .nrz/runs/*.json | jq -r '.envMode'
  strict
  $ cat .nrz/runs/*.json | jq -r '.tasks[0].envMode'
  strict
  $ cat .nrz/runs/*.json | jq -r '.tasks[0].environmentVariables | {passthrough, globalPassthrough}'
  {
    "passthrough": null,
    "globalPassthrough": null
  }

Run as `loose`
  $ rm -rf .nrz/runs
  $ ${NRZ} run build --env-mode=loose --summarize > /dev/null
   WARNING  no output files found for task my-app#build. Please check your `outputs` key in `nrz.json`
  $ cat .nrz/runs/*.json | jq -r '.envMode'
  loose
  $ cat .nrz/runs/*.json | jq -r '.tasks[0].envMode'
  loose
  $ cat .nrz/runs/*.json | jq -r '.tasks[0].environmentVariables | {passthrough, globalPassthrough}'
  {
    "passthrough": null,
    "globalPassthrough": null
  }

All specified + infer
  $ rm -rf .nrz/runs
  $ ${TESTDIR}/../../../helpers/replace_nrz_json.sh $(pwd) "strict_env_vars/all.json"
  $ ${NRZ} run build --summarize > /dev/null
   WARNING  no output files found for task my-app#build. Please check your `outputs` key in `nrz.json`
  $ cat .nrz/runs/*.json | jq -r '.envMode'
  strict
  $ cat .nrz/runs/*.json | jq -r '.tasks[0].envMode'
  strict
  $ cat .nrz/runs/*.json | jq -r '.tasks[0].environmentVariables | {passthrough, globalPassthrough}'
  {
    "passthrough": [
      "LOCAL_VAR_PT=7cd1bb19c058cf4d6ad6aa579d685bddddf3ab587b78bdcb1e6e488fb6f47a3b"
    ],
    "globalPassthrough": null
  }

All specified + loose
  $ rm -rf .nrz/runs
  $ ${TESTDIR}/../../../helpers/replace_nrz_json.sh $(pwd) "strict_env_vars/all.json"
  $ ${NRZ} run build --env-mode=loose --summarize > /dev/null
   WARNING  no output files found for task my-app#build. Please check your `outputs` key in `nrz.json`
  $ cat .nrz/runs/*.json | jq -r '.envMode'
  loose
  $ cat .nrz/runs/*.json | jq -r '.tasks[0].envMode'
  loose
  $ cat .nrz/runs/*.json | jq -r '.tasks[0].environmentVariables | {passthrough, globalPassthrough}'
  {
    "passthrough": [
      "LOCAL_VAR_PT=7cd1bb19c058cf4d6ad6aa579d685bddddf3ab587b78bdcb1e6e488fb6f47a3b"
    ],
    "globalPassthrough": null
  }

Global passthrough specified empty array + infer
  $ rm -rf .nrz/runs
  $ ${TESTDIR}/../../../helpers/replace_nrz_json.sh $(pwd) "strict_env_vars/global_pt-empty.json"
  $ ${NRZ} run build --summarize > /dev/null
  $ cat .nrz/runs/*.json | jq -r '.envMode'
  strict
  $ cat .nrz/runs/*.json | jq -r '.tasks[0].envMode'
  strict
  $ cat .nrz/runs/*.json | jq -r '.tasks[0].environmentVariables | {passthrough, globalPassthrough}'
  {
    "passthrough": null,
    "globalPassthrough": null
  }

Global passthrough specified value + infer
  $ rm -rf .nrz/runs
  $ ${TESTDIR}/../../../helpers/replace_nrz_json.sh $(pwd) "strict_env_vars/global_pt.json"
  $ ${NRZ} run build --summarize > /dev/null
   WARNING  no output files found for task my-app#build. Please check your `outputs` key in `nrz.json`
  $ cat .nrz/runs/*.json | jq -r '.envMode'
  strict
  $ cat .nrz/runs/*.json | jq -r '.tasks[0].envMode'
  strict
  $ cat .nrz/runs/*.json | jq -r '.tasks[0].environmentVariables | {passthrough, globalPassthrough}'
  {
    "passthrough": null,
    "globalPassthrough": null
  }

Global passthrough specified empty array + loose
  $ rm -rf .nrz/runs
  $ ${TESTDIR}/../../../helpers/replace_nrz_json.sh $(pwd) "strict_env_vars/global_pt-empty.json"
  $ ${NRZ} run build --env-mode=loose --summarize > /dev/null
  $ cat .nrz/runs/*.json | jq -r '.envMode'
  loose
  $ cat .nrz/runs/*.json | jq -r '.tasks[0].envMode'
  loose
  $ cat .nrz/runs/*.json | jq -r '.tasks[0].environmentVariables | {passthrough, globalPassthrough}'
  {
    "passthrough": null,
    "globalPassthrough": null
  }

Global passthrough specified value + loose
  $ rm -rf .nrz/runs
  $ ${TESTDIR}/../../../helpers/replace_nrz_json.sh $(pwd) "strict_env_vars/global_pt.json"
  $ ${NRZ} run build --env-mode=loose --summarize > /dev/null
  $ cat .nrz/runs/*.json | jq -r '.envMode'
  loose
  $ cat .nrz/runs/*.json | jq -r '.tasks[0].envMode'
  loose
  $ cat .nrz/runs/*.json | jq -r '.tasks[0].environmentVariables | {passthrough, globalPassthrough}'
  {
    "passthrough": null,
    "globalPassthrough": null
  }

Task passthrough specified empty array + infer
  $ rm -rf .nrz/runs
  $ ${TESTDIR}/../../../helpers/replace_nrz_json.sh $(pwd) "strict_env_vars/task_pt-empty.json"
  $ ${NRZ} run build --summarize > /dev/null
  $ cat .nrz/runs/*.json | jq -r '.envMode'
  strict
  $ cat .nrz/runs/*.json | jq -r '.tasks[0].envMode'
  strict
  $ cat .nrz/runs/*.json | jq -r '.tasks[0].environmentVariables | {passthrough, globalPassthrough}'
  {
    "passthrough": [],
    "globalPassthrough": null
  }

Task passthrough specified value + infer
  $ rm -rf .nrz/runs
  $ ${TESTDIR}/../../../helpers/replace_nrz_json.sh $(pwd) "strict_env_vars/task_pt.json"
  $ ${NRZ} run build --summarize > /dev/null
   WARNING  no output files found for task my-app#build. Please check your `outputs` key in `nrz.json`
  $ cat .nrz/runs/*.json | jq -r '.envMode'
  strict
  $ cat .nrz/runs/*.json | jq -r '.tasks[0].envMode'
  strict
  $ cat .nrz/runs/*.json | jq -r '.tasks[0].environmentVariables | {passthrough, globalPassthrough}'
  {
    "passthrough": [
      "LOCAL_VAR_PT=7cd1bb19c058cf4d6ad6aa579d685bddddf3ab587b78bdcb1e6e488fb6f47a3b"
    ],
    "globalPassthrough": null
  }

Task passthrough specified empty array + loose
  $ rm -rf .nrz/runs
  $ ${TESTDIR}/../../../helpers/replace_nrz_json.sh $(pwd) "strict_env_vars/task_pt-empty.json"
  $ ${NRZ} run build --env-mode=loose --summarize > /dev/null
  $ cat .nrz/runs/*.json | jq -r '.envMode'
  loose
  $ cat .nrz/runs/*.json | jq -r '.tasks[0].envMode'
  loose
  $ cat .nrz/runs/*.json | jq -r '.tasks[0].environmentVariables | {passthrough, globalPassthrough}'
  {
    "passthrough": [],
    "globalPassthrough": null
  }

Task passthrough specified value + loose
  $ rm -rf .nrz/runs
  $ ${TESTDIR}/../../../helpers/replace_nrz_json.sh $(pwd) "strict_env_vars/task_pt.json"
  $ ${NRZ} run build --env-mode=loose --summarize > /dev/null
  $ cat .nrz/runs/*.json | jq -r '.envMode'
  loose
  $ cat .nrz/runs/*.json | jq -r '.tasks[0].envMode'
  loose
  $ cat .nrz/runs/*.json | jq -r '.tasks[0].environmentVariables | {passthrough, globalPassthrough}'
  {
    "passthrough": [
      "LOCAL_VAR_PT=7cd1bb19c058cf4d6ad6aa579d685bddddf3ab587b78bdcb1e6e488fb6f47a3b"
    ],
    "globalPassthrough": null
  }

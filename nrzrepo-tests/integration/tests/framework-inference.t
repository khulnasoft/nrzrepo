Setup
  $ . ${TESTDIR}/../../helpers/setup_integration_test.sh framework_inference --no-install

Prove that we start with no inferred variables
  $ ${NRZ} run build --dry=json | jq -r '.tasks[].environmentVariables.inferred'
  []

Add in an inferred variable
  $ NEXT_PUBLIC_CHANGED=true ${NRZ} run build --dry=json | jq -c '.tasks[].environmentVariables.inferred'
  ["NEXT_PUBLIC_CHANGED=b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b"]

Baseline for excluding via NRZ_CI_VENDOR_ENV_KEY
  $ NEXT_PUBLIC_CHANGED=true NEXT_PUBLIC_IGNORED_VALUE=true ${NRZ} run build --dry=json | jq -c '.tasks[].environmentVariables.inferred'
  ["NEXT_PUBLIC_CHANGED=b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b","NEXT_PUBLIC_IGNORED_VALUE=b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b"]

Exclude a variable using NRZ_CI_VENDOR_ENV_KEY
  $ NEXT_PUBLIC_CHANGED=true NEXT_PUBLIC_IGNORED_VALUE=true NRZ_CI_VENDOR_ENV_KEY=NEXT_PUBLIC_IGNORED_ ${NRZ} run build --dry=json | jq -c '.tasks[].environmentVariables.inferred'
  ["NEXT_PUBLIC_CHANGED=b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b"]

Switch off framework inference and we no longer include inferred variables.
  $ NEXT_PUBLIC_CHANGED=true ${NRZ} run build --framework-inference=false --dry=json | jq -r '.tasks[].environmentVariables.inferred'
  []

Confirm that the right values appear in the run summary when framework inference is on.
  $ ${NRZ} run build --framework-inference=true --dry=json > output.json
  $ cat output.json | jq -r '.frameworkInference'
  true
  $ cat output.json | jq -r '.tasks[].framework'
  nextjs

Confirm that the right values appear in the run summary when framework inference is off.
  $ ${NRZ} run build --framework-inference=false --dry=json > output.json
  $ cat output.json | jq -r '.frameworkInference'
  false
  $ cat output.json | jq -r '.tasks[].framework'
  

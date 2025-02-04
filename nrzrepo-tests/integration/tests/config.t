Setup
  $ . ${TESTDIR}/../../helpers/setup_integration_test.sh

Run test run
  $ ${NRZ} config
  {
    "apiUrl": "https://vercel.com/api",
    "loginUrl": "https://vercel.com",
    "teamSlug": null,
    "teamId": null,
    "signature": false,
    "preflight": false,
    "timeout": 30,
    "uploadTimeout": 60,
    "enabled": true,
    "spacesId": null,
    "ui": "stream",
    "packageManager": "npm",
    "daemon": null,
    "envMode": "strict",
    "scmBase": null,
    "scmHead": null,
    "cacheDir": ".nrz[\\/]+cache" (re)
  }

Run test run with api overloaded
  $ ${NRZ} config --api http://localhost:8000 | jq .apiUrl
  "http://localhost:8000"

Run test run with team overloaded
  $ ${NRZ} config --team vercel | jq .teamSlug
  "vercel"

Run test run with team overloaded from both env and flag (flag should take precedence)
  $ NRZ_TEAM=vercel ${NRZ} config --team nrz | jq .teamSlug
  "nrz"

Run test run with remote cache timeout env variable set
  $ NRZ_REMOTE_CACHE_TIMEOUT=123 ${NRZ} config | jq .timeout
  123

Run test run with remote cache timeout from both env and flag (flag should take precedence)
  $ NRZ_REMOTE_CACHE_TIMEOUT=123 ${NRZ} config --remote-cache-timeout 456 | jq .timeout
  456

Use our custom nrz config with an invalid env var
  $ . ${TESTDIR}/../../helpers/replace_nrz_json.sh $(pwd) "invalid-env-var.json"

Run build with invalid env var
  $ ${NRZ} build
  invalid_env_prefix (https://turbo.build/messages/invalid-env-prefix)
  
    x Environment variables should not be prefixed with "$"
     ,-[nrz.json:6:1]
   6 |     "build": {
   7 |       "env": ["NODE_ENV", "$FOOBAR"],
     :                           ^^^^|^^^^
     :                               `-- variable with invalid prefix declared here
   8 |       "outputs": []
     `----
  
  [1]

Confirm that the daemon is not configured
  $ ${NRZ} config | jq .daemon
  null

Add env var: `NRZ_DAEMON=true`
  $ NRZ_DAEMON=true ${NRZ} config | jq .daemon
  true

Add env var: `NRZ_DAEMON=false`
  $ NRZ_DAEMON=false ${NRZ} config | jq .daemon
  false

Add flag: `--daemon`
  $ ${NRZ} --daemon config | jq .daemon
  true

Add flag: `--no-daemon`
  $ ${NRZ} --no-daemon config | jq .daemon
  false

Confirm that the envMode is `strict` by default
  $ ${NRZ} config | jq .envMode
  "strict"

Add env var: `NRZ_ENV_MODE=loose`
  $ NRZ_ENV_MODE=loose ${NRZ} config | jq .envMode
  "loose"

Add flag: `--env-mode=loose`
  $ ${NRZ} --env-mode=loose config | jq .envMode
  "loose"

Add env var `NRZ_SCM_BASE=HEAD`
  $ NRZ_SCM_BASE="HEAD" ${NRZ} config | jq .scmBase
  "HEAD"

Add env var `NRZ_SCM_HEAD=my-branch`
  $ NRZ_SCM_HEAD="my-branch" ${NRZ} config | jq .scmHead
  "my-branch"

No cacheDir by default
  $ ${NRZ} config | jq -r .cacheDir
  .nrz[\\/]cache (re)

Add env var: `NRZ_CACHE_DIR`
  $ NRZ_CACHE_DIR=FifthDimension/Nebulo9 ${NRZ} config | jq -r .cacheDir
  FifthDimension[\\/]Nebulo9 (re)

Add flag: `--cache-dir`
  $ ${NRZ} --cache-dir FifthDimension/Nebulo9 config | jq -r .cacheDir
  FifthDimension[\\/]Nebulo9 (re)

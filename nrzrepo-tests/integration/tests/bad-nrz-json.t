Setup
  $ . ${TESTDIR}/../../helpers/setup_integration_test.sh

Add nrz.json with unnecessary package task syntax to a package
  $ . ${TESTDIR}/../../helpers/replace_nrz_json.sh $(pwd)/apps/my-app "package-task.json"

Run build with package task in non-root nrz.json
  $ ${NRZ} build 2> error.txt
  [1]
  $ sed  's/\[\([^]]*\)\]/\(\1)/g' < error.txt
    x Invalid nrz.json configuration
  
  Error: unnecessary_package_task_syntax (https://turbo.build/messages/unnecessary-package-task-syntax)
  
    x "my-app#build". Use "build" instead.
      ,-\(apps[\\/]my-app[\\/]nrz.json:7:1\) (re)
    7 |         // this comment verifies that nrz can read .json files with comments
    8 | ,->     "my-app#build": {
    9 | |         "outputs": ("banana.txt", "apple.json"),
   10 | |         "inputs": ("$NRZ_DEFAULT$", ".env.local")
   11 | |->     }
      : `---- unnecessary package syntax found here
   12 |       }
      `----
  




Remove unnecessary package task syntax
  $ rm $(pwd)/apps/my-app/nrz.json

Use our custom nrz config with an invalid env var
  $ . ${TESTDIR}/../../helpers/replace_nrz_json.sh $(pwd) "invalid-env-var.json"

Run build with invalid env var
  $ ${NRZ} build 2> error.txt
  [1]
  $ sed  's/\[\([^]]*\)\]/\(\1)/g' < error.txt
  invalid_env_prefix (https://turbo.build/messages/invalid-env-prefix)
  
    x Environment variables should not be prefixed with "$"
     ,-\(nrz.json:6:1\) (re)
   6 |     "build": {
   7 |       "env": ("NODE_ENV", "$FOOBAR"),
     :                           ^^^^|^^^^
     :                               `-- variable with invalid prefix declared here
   8 |       "outputs": ()
     `----
  



Run in single package mode even though we have a task with package syntax
  $ ${NRZ} build --single-package 2> error.txt
  [1]
  $ sed  's/\[\([^]]*\)\]/\(\1)/g' < error.txt
  package_task_in_single_package_mode (https://turbo.build/messages/package-task-in-single-package-mode)
  
    x Package tasks (<package>#<task>) are not allowed in single-package
    | repositories: found //#something
      ,-(nrz.json:16:1)
   16 |     "something": {},
   17 |     "//#something": {},
      :                     ^|
      :                      `-- package task found here
   18 | 
      `----
  

Use our custom nrz config which has interruptible: true
  $ . ${TESTDIR}/../../helpers/replace_nrz_json.sh $(pwd) "interruptible-but-not-persistent.json"

Build should fail
  $ ${NRZ} run build
    x Interruptible tasks must be persistent.
      ,-[nrz.json:14:1]
   14 |       ],
   15 |       "interruptible": true,
      :                        ^^|^
      :                          `-- `interruptible` set here
   16 |       "outputs": []
      `----
  
  [1]

Use our custom nrz config with syntax errors
  $ . ${TESTDIR}/../../helpers/replace_nrz_json.sh $(pwd) "syntax-error.json"

Run build with syntax errors in nrz.json
  $ ${NRZ} build
  nrz_json_parse_error
  
    x Failed to parse nrz.json.
  
  Error:   x Expected a property but instead found ','.
     ,-[nrz.json:1:1]
   1 | {
   2 |   "$schema": "https://turbo.build/schema.json",,
     :                                                ^
   3 |   "globalDependencies": ["foo.txt"],
     `----
  Error:   x expected `,` but instead found `42`
      ,-[nrz.json:11:1]
   11 |     "my-app#build": {
   12 |       "outputs": ["banana.txt", "apple.json"]42,
      :                                              ^^
   13 |       "inputs": [".env.local"
      `----
  Error:   x expected `,` but instead found `}`
      ,-[nrz.json:13:1]
   13 |       "inputs": [".env.local"
   14 |     },
      :     ^
   15 | 
      `----
  
  [1]

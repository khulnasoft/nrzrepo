Setup
  $ . ${TESTDIR}/../../../helpers/setup_integration_test.sh single_package

  $ ${NRZ} run test --dry=json
  {
    "id": "[a-zA-Z0-9]+", (re)
    "version": "1",
    "nrzVersion": "[a-z0-9\.-]+", (re)
    "monorepo": false,
    "globalCacheInputs": {
      "rootKey": "I can\xe2\x80\x99t see ya, but I know you\xe2\x80\x99re here", (esc)
      "files": {
        "package-lock.json": "1c117cce37347befafe3a9cba1b8a609b3600021",
        "package.json": "8606ff4b95a5330740d8d9d0948faeada64f1f32",
        "somefile.txt": "45b983be36b73c0788dc9cbcb76cbb80fc7bb057"
      },
      "hashOfExternalDependencies": "",
      "hashOfInternalDependencies": "",
      "environmentVariables": {
        "specified": {
          "env": [],
          "passThroughEnv": null
        },
        "configured": [],
        "inferred": [],
        "passthrough": null
      },
      "engines": null
    },
    "envMode": "strict",
    "frameworkInference": true,
    "tasks": [
      {
        "taskId": "build",
        "task": "build",
        "hash": "bff0057a2fc6e6d5",
        "inputs": {
          ".gitignore": "50c750ceeaf56f5dd0b4a1dc723c1fd3a7573c89",
          "nrz.json": "ce5bdbed55601768de641f5d8d005a8f5be8d3f7",
          "package-lock.json": "1c117cce37347befafe3a9cba1b8a609b3600021",
          "package.json": "8606ff4b95a5330740d8d9d0948faeada64f1f32",
          "somefile.txt": "45b983be36b73c0788dc9cbcb76cbb80fc7bb057"
        },
        "hashOfExternalDependencies": "",
        "cache": {
          "local": false,
          "remote": false,
          "status": "MISS",
          "timeSaved": 0
        },
        "command": "echo building > foo.txt",
        "cliArguments": [],
        "outputs": [
          "foo.txt"
        ],
        "excludedOutputs": null,
        "logFile": "\.nrz(\/|\\\\)nrz-build\.log", (re)
        "dependencies": [],
        "dependents": [
          "test"
        ],
        "resolvedTaskDefinition": {
          "outputs": [
            "foo.txt"
          ],
          "cache": true,
          "dependsOn": [],
          "inputs": [],
          "outputLogs": "full",
          "persistent": false,
          "interruptible": false,
          "env": [],
          "passThroughEnv": null,
          "interactive": false
        },
        "expandedOutputs": [],
        "framework": "",
        "envMode": "strict",
        "environmentVariables": {
          "specified": {
            "env": [],
            "passThroughEnv": null
          },
          "configured": [],
          "inferred": [],
          "passthrough": null
        }
      },
      {
        "taskId": "test",
        "task": "test",
        "hash": "a64c49d5ab6ac4db",
        "inputs": {
          ".gitignore": "50c750ceeaf56f5dd0b4a1dc723c1fd3a7573c89",
          "nrz.json": "ce5bdbed55601768de641f5d8d005a8f5be8d3f7",
          "package-lock.json": "1c117cce37347befafe3a9cba1b8a609b3600021",
          "package.json": "8606ff4b95a5330740d8d9d0948faeada64f1f32",
          "somefile.txt": "45b983be36b73c0788dc9cbcb76cbb80fc7bb057"
        },
        "hashOfExternalDependencies": "",
        "cache": {
          "local": false,
          "remote": false,
          "status": "MISS",
          "timeSaved": 0
        },
        "command": "cat foo.txt",
        "cliArguments": [],
        "outputs": null,
        "excludedOutputs": null,
        "logFile": "\.nrz(\/|\\\\)nrz-test\.log", (re)
        "dependencies": [
          "build"
        ],
        "dependents": [],
        "resolvedTaskDefinition": {
          "outputs": [],
          "cache": true,
          "dependsOn": [
            "build"
          ],
          "inputs": [],
          "outputLogs": "full",
          "persistent": false,
          "interruptible": false,
          "env": [],
          "passThroughEnv": null,
          "interactive": false
        },
        "expandedOutputs": [],
        "framework": "",
        "envMode": "strict",
        "environmentVariables": {
          "specified": {
            "env": [],
            "passThroughEnv": null
          },
          "configured": [],
          "inferred": [],
          "passthrough": null
        }
      }
    ],
    "user": ".*", (re)
    "scm": {
      "type": "git",
      "sha": "[a-z0-9]+", (re)
      "branch": ".+" (re)
    }
  }
  

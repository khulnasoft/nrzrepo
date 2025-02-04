Setup
  $ . ${TESTDIR}/../../helpers/setup_integration_test.sh

Run info
  $ ${NRZ} ls
   WARNING  ls command is experimental and may change in the future
  3 packages (npm)
  
    another packages[\/\\]another (re)
    my-app apps[\/\\]my-app (re)
    util packages[\/\\]util (re)

Run info with json output
  $ ${NRZ} ls --output=json
   WARNING  ls command is experimental and may change in the future
  {
    "packageManager": "npm",
    "packages": {
      "count": 3,
      "items": [
        {
          "name": "another",
          "path": "packages(\/|\\\\)another" (re)
        },
        {
          "name": "my-app",
          "path": "apps(\/|\\\\)my-app" (re)
        },
        {
          "name": "util",
          "path": "packages(\/|\\\\)util" (re)
        }
      ]
    }
  }

Run info with filter
  $ ${NRZ} ls -F my-app...
   WARNING  ls command is experimental and may change in the future
  2 packages (npm)
  
    my-app apps[\/\\]my-app (re)
    util packages[\/\\]util (re)

Run info on package `another`
  $ ${NRZ} ls another
   WARNING  ls command is experimental and may change in the future
  another depends on: <no packages>
  
  tasks:
    dev: echo building
  

Run info on package `my-app`
  $ ${NRZ} ls my-app
   WARNING  ls command is experimental and may change in the future
  my-app depends on: util
  
  tasks:
    build: echo building
    maybefails: exit 4
  
Run info on package `my-app` with json output
  $ ${NRZ} ls my-app --output=json
   WARNING  ls command is experimental and may change in the future
  {
    "packages": [
      {
        "name": "my-app",
        "tasks": {
          "count": 2,
          "items": [
            {
              "name": "build",
              "command": "echo building"
            },
            {
              "name": "maybefails",
              "command": "exit 4"
            }
          ]
        },
        "dependencies": [
          "util"
        ]
      }
    ]
  }

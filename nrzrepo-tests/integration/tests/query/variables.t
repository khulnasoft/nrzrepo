Setup
  $ . ${TESTDIR}/../../../helpers/setup_integration_test.sh

Create a variables file
  $ echo '{ "name": "my-app" }' > vars.json

Query packages
  $ ${NRZ} query 'query($name: String) { package(name: $name) { name } }' --variables vars.json | jq
   WARNING  query command is experimental and may change in the future
  {
    "data": {
      "package": {
        "name": "my-app"
      }
    }
  }

Write query to file
  $ echo 'query($name: String) { package(name: $name) { name } }' > query.gql

Run the query
  $ ${NRZ} query query.gql --variables vars.json | jq
   WARNING  query command is experimental and may change in the future
  {
    "data": {
      "package": {
        "name": "my-app"
      }
    }
  }

Make sure we can't pass variables without a query
  $ ${NRZ} query --variables vars.json
   ERROR  the following required arguments were not provided:
    <QUERY>
  
  Usage: nrz(.exe)? query --variables <VARIABLES> <QUERY> (re)
  
  For more information, try '--help'.
  
  [1]




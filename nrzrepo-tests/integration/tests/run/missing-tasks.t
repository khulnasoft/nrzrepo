Setup
  $ . ${TESTDIR}/../../../helpers/setup_integration_test.sh

# Running non-existent tasks errors
  $ ${NRZ} run doesnotexist
    x Missing tasks in project
  
  Error:   x Could not find task `doesnotexist` in project
  
  [1]

# Multiple non-existent tasks also error
  $ ${NRZ} run doesnotexist alsono
    x Missing tasks in project
  
  Error:   x Could not find task `alsono` in project
  Error:   x Could not find task `doesnotexist` in project
  
  [1]

# One good and one bad task does not error
  $ ${NRZ} run build doesnotexist
    x Missing tasks in project
  
  Error:   x Could not find task `doesnotexist` in project
  
  [1]

# Bad command
  $ ${NRZ} run something --dry > OUTPUT 2>&1
  [1]
  $ grep --quiet -E "root task (//#)?something \(nrz run build\) looks like it invokes nrz and" OUTPUT
  [1]
  $ grep --quiet -E "might cause a loop" OUTPUT
  [1]

# Bad command

  $ ${NRZ} run something > OUTPUT2 2>&1
  [1]
  $ grep --quiet -E "root task (//#)?something \(nrz run build\) looks like it invokes nrz and" OUTPUT
  [1]
  $ grep --quiet -E "might cause a loop" OUTPUT
  [1]

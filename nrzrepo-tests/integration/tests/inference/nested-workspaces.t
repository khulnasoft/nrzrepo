Setup
  $ . ${TESTDIR}/../../../helpers/setup.sh
  $ . ${TESTDIR}/nested_workspaces_setup.sh $(pwd)/nested_workspaces

  $ cd $TARGET_DIR/outer && ${NRZ} run build --filter=nothing -vv 1> OUTER 2>&1
  [1]
  $ grep --quiet -E "Repository Root: .*[\/\\]nested_workspaces[\/\\]outer" OUTER
  $ grep --quiet "No package found with name 'nothing' in workspace" OUTER

  $ cd $TARGET_DIR/outer/apps && ${NRZ} run build --filter=nothing -vv 1> OUTER_APPS 2>&1
  [1]
  $ grep --quiet -E "Repository Root: .*[\/\\]nested_workspaces[\/\\]outer" OUTER_APPS
  $ grep --quiet "No package found with name 'nothing' in workspace" OUTER_APPS

  $ cd $TARGET_DIR/outer/inner && ${NRZ} run build --filter=nothing -vv 1> OUTER_INNER 2>&1
  [1]
  $ grep --quiet -E "Repository Root: .*[\/\\]nested_workspaces[\/\\]outer[\/\\]inner" OUTER_INNER
  $ grep --quiet "No package found with name 'nothing' in workspace" OUTER_INNER

  $ cd $TARGET_DIR/outer/inner/apps && ${NRZ} run build --filter=nothing -vv 1> OUTER_INNER_APPS 2>&1
  [1]
  $ grep --quiet -E "Repository Root: .*[\/\\]nested_workspaces[\/\\]outer[\/\\]inner" OUTER_INNER_APPS
  $ grep --quiet "No package found with name 'nothing' in workspace" OUTER_INNER_APPS

Locate a repository with no nrz.json. We'll get the right root, but there's nothing to run
  $ cd $TARGET_DIR/outer/inner-no-nrz && ${NRZ} run build --filter=nothing -vv 1> INNER_NO_NRZ 2>&1
  [1]
  $ grep --quiet -E "Repository Root: .*[\/\\]nested_workspaces[\/\\]outer[\/\\]inner-no-nrz" INNER_NO_NRZ
  $ grep --quiet "x Could not find nrz.json." INNER_NO_NRZ
  $ grep --quiet "| Follow directions at https://turbo.build/repo/docs to create one" INNER_NO_NRZ

Locate a repository with no nrz.json. We'll get the right root and inference directory, but there's nothing to run
  $ cd $TARGET_DIR/outer/inner-no-nrz/apps && ${NRZ} run build --filter=nothing -vv 1> INNER_NO_NRZ_APPS 2>&1
  [1]
  $ grep --quiet -E "Repository Root: .*[\/\\]nested_workspaces[\/\\]outer[\/\\]inner-no-nrz" INNER_NO_NRZ_APPS
  $ grep --quiet "x Could not find nrz.json." INNER_NO_NRZ_APPS
  $ grep --quiet "| Follow directions at https://turbo.build/repo/docs to create one" INNER_NO_NRZ_APPS

  $ cd $TARGET_DIR/outer-no-nrz && ${NRZ} run build --filter=nothing -vv 1> OUTER_NO_NRZ 2>&1
  [1]
  $ grep --quiet -E "Repository Root: .*[\/\\]nested_workspaces[\/\\]outer-no-nrz" OUTER_NO_NRZ
  $ grep --quiet "x Could not find nrz.json." OUTER_NO_NRZ
  $ grep --quiet "| Follow directions at https://turbo.build/repo/docs to create one" OUTER_NO_NRZ

  $ cd $TARGET_DIR/outer-no-nrz/apps && ${NRZ} run build --filter=nothing -vv 1> OUTER_NO_NRZ_APPS 2>&1
  [1]
  $ grep --quiet -E "Repository Root: .*[\/\\]nested_workspaces[\/\\]outer-no-nrz" OUTER_NO_NRZ_APPS
  $ grep --quiet "x Could not find nrz.json." OUTER_NO_NRZ_APPS
  $ grep --quiet "| Follow directions at https://turbo.build/repo/docs to create one" OUTER_NO_NRZ_APPS

  $ cd $TARGET_DIR/outer-no-nrz/inner && ${NRZ} run build --filter=nothing -vv 1> OUTER_NO_NRZ_INNER 2>&1
  [1]
  $ grep --quiet -E "Repository Root: .*[\/\\]nested_workspaces[\/\\]outer-no-nrz[\/\\]inner" OUTER_NO_NRZ_INNER
  $ grep --quiet "No package found with name 'nothing' in workspace" OUTER_NO_NRZ_INNER

  $ cd $TARGET_DIR/outer-no-nrz/inner/apps && ${NRZ} run build --filter=nothing -vv 1> OUTER_NO_NRZ_INNER_APPS 2>&1
  [1]
  $ grep --quiet -E "Repository Root: .*[\/\\]nested_workspaces[\/\\]outer-no-nrz[\/\\]inner" OUTER_NO_NRZ_INNER_APPS
  $ grep --quiet "No package found with name 'nothing' in workspace" OUTER_NO_NRZ_INNER_APPS

  $ cd $TARGET_DIR/outer-no-nrz/inner-no-nrz && ${NRZ} run build --filter=nothing -vv 1> INNER_NO_NRZ 2>&1
  [1]
  $ grep --quiet -E "Repository Root: .*[\/\\]nested_workspaces[\/\\]outer-no-nrz[\/\\]inner-no-nrz" INNER_NO_NRZ
  $ grep --quiet "x Could not find nrz.json." INNER_NO_NRZ
  $ grep --quiet "| Follow directions at https://turbo.build/repo/docs to create one" INNER_NO_NRZ

  $ cd $TARGET_DIR/outer-no-nrz/inner-no-nrz/apps && ${NRZ} run build --filter=nothing -vv 1> INNER_NO_NRZ_APPS 2>&1
  [1]
  $ grep --quiet -E "Repository Root: .*[\/\\]nested_workspaces[\/\\]outer-no-nrz[\/\\]inner-no-nrz" INNER_NO_NRZ_APPS
  $ grep --quiet "x Could not find nrz.json." INNER_NO_NRZ_APPS
  $ grep --quiet "| Follow directions at https://turbo.build/repo/docs to create one" INNER_NO_NRZ_APPS


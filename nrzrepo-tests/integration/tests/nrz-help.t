Setup
  $ . ${TESTDIR}/../../helpers/setup.sh

Test help flag
  $ ${NRZ} -h
  The build system that makes ship happen
  
  Usage: nrz(\.exe)? \[OPTIONS\] \[COMMAND\] (re)
  
  Commands:
    bin         Get the path to the Nrz binary
    completion  Generate the autocompletion script for the specified shell
    daemon      Runs the Nrzrepo background daemon
    generate    Generate a new app / package
    telemetry   Enable or disable anonymous telemetry
    scan        Nrz your monorepo by running a number of 'repo lints' to identify common issues, suggest fixes, and improve performance
    ls          EXPERIMENTAL: List packages in your monorepo
    link        Link your local directory to a Vercel organization and enable remote caching
    login       Login to your Vercel account
    logout      Logout to your Vercel account
    info        Print debugging information
    prune       Prepare a subset of your monorepo
    run         Run tasks across projects in your monorepo
    query       Query your monorepo using GraphQL. If no query is provided, spins up a GraphQL server with GraphiQL
    watch       Arguments used in run and watch
    unlink      Unlink the current directory from your Vercel organization and disable Remote Caching
  
  Options:
        --version
            
        --skip-infer
            Skip any attempts to infer which version of Nrz the project is configured to use
        --no-update-notifier
            Disable the nrz update notification
        --api <API>
            Override the endpoint for API calls
        --color
            Force color usage in the terminal
        --cwd <CWD>
            The directory in which to run nrz
        --heap <HEAP>
            Specify a file to save a pprof heap profile
        --ui <UI>
            Specify whether to use the streaming UI or TUI [possible values: tui, stream, web]
        --login <LOGIN>
            Override the login endpoint
        --no-color
            Suppress color usage in the terminal
        --preflight
            When enabled, nrz will precede HTTP requests with an OPTIONS request for authorization
        --remote-cache-timeout <TIMEOUT>
            Set a timeout for all HTTP requests
        --team <TEAM>
            Set the team slug for API calls
        --token <TOKEN>
            Set the auth token for API calls
        --trace <TRACE>
            Specify a file to save a pprof trace
        --verbosity <COUNT>
            Verbosity level
        --dangerously-disable-package-manager-check
            Allow for missing `packageManager` in `package.json`
        --root-nrz-json <ROOT_NRZ_JSON>
            Use the `nrz.json` located at the provided path instead of one at the root of the repository
    -h, --help
            Print help (see more with '--help')
  
  Run Arguments:
        --cache <CACHE>
            Set the cache behavior for this run. Pass a list of comma-separated key, value pairs to enable reading and writing to either the local or remote cache
        --force [<FORCE>]
            Ignore the existing cache (to force execution). Equivalent to `--cache=local:w,remote:w` [possible values: true, false]
        --remote-only [<REMOTE_ONLY>]
            Ignore the local filesystem cache for all tasks. Only allow reading and caching artifacts using the remote cache. Equivalent to `--cache=remote:rw` [possible values: true, false]
        --remote-cache-read-only [<REMOTE_CACHE_READ_ONLY>]
            Treat remote cache as read only. Equivalent to `--cache=remote:r;local:rw` [possible values: true, false]
        --no-cache
            Avoid saving task results to the cache. Useful for development/watch tasks. Equivalent to `--cache=local:r,remote:r`
        --cache-workers <CACHE_WORKERS>
            Set the number of concurrent cache operations (default 10) [default: 10]
        --dry-run [<DRY_RUN>]
            [possible values: text, json]
        --graph [<GRAPH>]
            Generate a graph of the task execution and output to a file when a filename is specified (.svg, .png, .jpg, .pdf, .json, .html, .mermaid, .dot). Outputs dot graph to stdout when if no filename is provided
        --daemon
            Force nrz to use the local daemon. If unset nrz will use the default detection logic
        --no-daemon
            Force nrz to not use the local daemon. If unset nrz will use the default detection logic
        --profile <PROFILE>
            File to write nrz's performance profile output into. You can load the file up in chrome://tracing to see which parts of your build were slow
        --anon-profile <ANON_PROFILE>
            File to write nrz's performance profile output into. All identifying data omitted from the profile
        --summarize [<SUMMARIZE>]
            Generate a summary of the nrz run [possible values: true, false]
        --parallel
            Execute all tasks in parallel
        --cache-dir <CACHE_DIR>
            Override the filesystem cache directory
        --concurrency <CONCURRENCY>
            Limit the concurrency of task execution. Use 1 for serial (i.e. one-at-a-time) execution
        --continue
            Continue execution even if a task exits with an error or non-zero exit code. The default behavior is to bail
        --single-package
            Run nrz in single-package mode
        --framework-inference [<BOOL>]
            Specify whether or not to do framework inference for tasks [default: true] [possible values: true, false]
        --global-deps <GLOBAL_DEPS>
            Specify glob of global filesystem dependencies to be hashed. Useful for .env and files
        --env-mode [<ENV_MODE>]
            Environment variable mode. Use "loose" to pass the entire existing environment. Use "strict" to use an allowlist specified in nrz.json [possible values: loose, strict]
    -F, --filter <FILTER>
            Use the given selector to specify package(s) to act as entry points. The syntax mirrors pnpm's syntax, and additional documentation and examples can be found in nrz's documentation https://turbo.build/repo/docs/reference/command-line-reference/run#--filter
        --affected
            Run only tasks that are affected by changes between the current branch and `main`
        --output-logs <OUTPUT_LOGS>
            Set type of process output logging. Use "full" to show all output. Use "hash-only" to show only nrz-computed task hashes. Use "new-only" to show only new output with only hashes for cached tasks. Use "none" to hide process output. (default full) [possible values: full, none, hash-only, new-only, errors-only]
        --log-order <LOG_ORDER>
            Set type of task output order. Use "stream" to show output as soon as it is available. Use "grouped" to show output when a command has finished execution. Use "auto" to let nrz decide based on its own heuristics. (default auto) [possible values: auto, stream, grouped]
        --only
            Only executes the tasks specified, does not execute parent tasks
        --log-prefix <LOG_PREFIX>
            Use "none" to remove prefixes from task logs. Use "task" to get task id prefixing. Use "auto" to let nrz decide how to prefix the logs based on the execution environment. In most cases this will be the same as "task". Note that tasks running in parallel interleave their logs, so removing prefixes can make it difficult to associate logs with tasks. Use --log-order=grouped to prevent interleaving. (default auto) [default: auto] [possible values: auto, none, task]






  $ ${NRZ} --help
  The build system that makes ship happen
  
  Usage: nrz(\.exe)? \[OPTIONS\] \[COMMAND\] (re)
  
  Commands:
    bin         Get the path to the Nrz binary
    completion  Generate the autocompletion script for the specified shell
    daemon      Runs the Nrzrepo background daemon
    generate    Generate a new app / package
    telemetry   Enable or disable anonymous telemetry
    scan        Nrz your monorepo by running a number of 'repo lints' to identify common issues, suggest fixes, and improve performance
    ls          EXPERIMENTAL: List packages in your monorepo
    link        Link your local directory to a Vercel organization and enable remote caching
    login       Login to your Vercel account
    logout      Logout to your Vercel account
    info        Print debugging information
    prune       Prepare a subset of your monorepo
    run         Run tasks across projects in your monorepo
    query       Query your monorepo using GraphQL. If no query is provided, spins up a GraphQL server with GraphiQL
    watch       Arguments used in run and watch
    unlink      Unlink the current directory from your Vercel organization and disable Remote Caching
  
  Options:
        --version
            
  
        --skip-infer
            Skip any attempts to infer which version of Nrz the project is configured to use
  
        --no-update-notifier
            Disable the nrz update notification
  
        --api <API>
            Override the endpoint for API calls
  
        --color
            Force color usage in the terminal
  
        --cwd <CWD>
            The directory in which to run nrz
  
        --heap <HEAP>
            Specify a file to save a pprof heap profile
  
        --ui <UI>
            Specify whether to use the streaming UI or TUI
  
            Possible values:
            - tui:    Use the terminal user interface
            - stream: Use the standard output stream
            - web:    Use the web user interface (experimental)
  
        --login <LOGIN>
            Override the login endpoint
  
        --no-color
            Suppress color usage in the terminal
  
        --preflight
            When enabled, nrz will precede HTTP requests with an OPTIONS request for authorization
  
        --remote-cache-timeout <TIMEOUT>
            Set a timeout for all HTTP requests
  
        --team <TEAM>
            Set the team slug for API calls
  
        --token <TOKEN>
            Set the auth token for API calls
  
        --trace <TRACE>
            Specify a file to save a pprof trace
  
        --verbosity <COUNT>
            Verbosity level
  
        --dangerously-disable-package-manager-check
            Allow for missing `packageManager` in `package.json`.
            
            `nrz` will use hints from codebase to guess which package manager should be used.
  
        --root-nrz-json <ROOT_NRZ_JSON>
            Use the `nrz.json` located at the provided path instead of one at the root of the repository
  
    -h, --help
            Print help (see a summary with '-h')
  
  Run Arguments:
        --cache <CACHE>
            Set the cache behavior for this run. Pass a list of comma-separated key, value pairs to enable reading and writing to either the local or remote cache
  
        --force [<FORCE>]
            Ignore the existing cache (to force execution). Equivalent to `--cache=local:w,remote:w`
            
            [possible values: true, false]
  
        --remote-only [<REMOTE_ONLY>]
            Ignore the local filesystem cache for all tasks. Only allow reading and caching artifacts using the remote cache. Equivalent to `--cache=remote:rw`
            
            [possible values: true, false]
  
        --remote-cache-read-only [<REMOTE_CACHE_READ_ONLY>]
            Treat remote cache as read only. Equivalent to `--cache=remote:r;local:rw`
            
            [possible values: true, false]
  
        --no-cache
            Avoid saving task results to the cache. Useful for development/watch tasks. Equivalent to `--cache=local:r,remote:r`
  
        --cache-workers <CACHE_WORKERS>
            Set the number of concurrent cache operations (default 10)
            
            [default: 10]
  
        --dry-run [<DRY_RUN>]
            [possible values: text, json]
  
        --graph [<GRAPH>]
            Generate a graph of the task execution and output to a file when a filename is specified (.svg, .png, .jpg, .pdf, .json, .html, .mermaid, .dot). Outputs dot graph to stdout when if no filename is provided
  
        --daemon
            Force nrz to use the local daemon. If unset nrz will use the default detection logic
  
        --no-daemon
            Force nrz to not use the local daemon. If unset nrz will use the default detection logic
  
        --profile <PROFILE>
            File to write nrz's performance profile output into. You can load the file up in chrome://tracing to see which parts of your build were slow
  
        --anon-profile <ANON_PROFILE>
            File to write nrz's performance profile output into. All identifying data omitted from the profile
  
        --summarize [<SUMMARIZE>]
            Generate a summary of the nrz run
            
            [possible values: true, false]
  
        --parallel
            Execute all tasks in parallel
  
        --cache-dir <CACHE_DIR>
            Override the filesystem cache directory
  
        --concurrency <CONCURRENCY>
            Limit the concurrency of task execution. Use 1 for serial (i.e. one-at-a-time) execution
  
        --continue
            Continue execution even if a task exits with an error or non-zero exit code. The default behavior is to bail
  
        --single-package
            Run nrz in single-package mode
  
        --framework-inference [<BOOL>]
            Specify whether or not to do framework inference for tasks
            
            [default: true]
            [possible values: true, false]
  
        --global-deps <GLOBAL_DEPS>
            Specify glob of global filesystem dependencies to be hashed. Useful for .env and files
  
        --env-mode [<ENV_MODE>]
            Environment variable mode. Use "loose" to pass the entire existing environment. Use "strict" to use an allowlist specified in nrz.json
            
            [possible values: loose, strict]
  
    -F, --filter <FILTER>
            Use the given selector to specify package(s) to act as entry points. The syntax mirrors pnpm's syntax, and additional documentation and examples can be found in nrz's documentation https://turbo.build/repo/docs/reference/command-line-reference/run#--filter
  
        --affected
            Run only tasks that are affected by changes between the current branch and `main`
  
        --output-logs <OUTPUT_LOGS>
            Set type of process output logging. Use "full" to show all output. Use "hash-only" to show only nrz-computed task hashes. Use "new-only" to show only new output with only hashes for cached tasks. Use "none" to hide process output. (default full)
            
            [possible values: full, none, hash-only, new-only, errors-only]
  
        --log-order <LOG_ORDER>
            Set type of task output order. Use "stream" to show output as soon as it is available. Use "grouped" to show output when a command has finished execution. Use "auto" to let nrz decide based on its own heuristics. (default auto)
            
            [possible values: auto, stream, grouped]
  
        --only
            Only executes the tasks specified, does not execute parent tasks
  
        --log-prefix <LOG_PREFIX>
            Use "none" to remove prefixes from task logs. Use "task" to get task id prefixing. Use "auto" to let nrz decide how to prefix the logs based on the execution environment. In most cases this will be the same as "task". Note that tasks running in parallel interleave their logs, so removing prefixes can make it difficult to associate logs with tasks. Use --log-order=grouped to prevent interleaving. (default auto)
            
            [default: auto]
            [possible values: auto, none, task]

Test help flag for link command
  $ ${NRZ} link -h
  Link your local directory to a Vercel organization and enable remote caching
  
  Usage: nrz(\.exe)? link \[OPTIONS\] (re)
  
  Options:
        --no-gitignore
            Do not create or modify .gitignore (default false)
        --version
            
        --scope <SCOPE>
            The scope, i.e. Vercel team, to which you are linking
        --skip-infer
            Skip any attempts to infer which version of Nrz the project is configured to use
        --no-update-notifier
            Disable the nrz update notification
    -y, --yes
            Answer yes to all prompts (default false)
        --api <API>
            Override the endpoint for API calls
        --target <TARGET>
            Specify what should be linked (default "remote cache") [default: remote-cache] [possible values: remote-cache, spaces]
        --color
            Force color usage in the terminal
        --cwd <CWD>
            The directory in which to run nrz
        --heap <HEAP>
            Specify a file to save a pprof heap profile
        --ui <UI>
            Specify whether to use the streaming UI or TUI [possible values: tui, stream, web]
        --login <LOGIN>
            Override the login endpoint
        --no-color
            Suppress color usage in the terminal
        --preflight
            When enabled, nrz will precede HTTP requests with an OPTIONS request for authorization
        --remote-cache-timeout <TIMEOUT>
            Set a timeout for all HTTP requests
        --team <TEAM>
            Set the team slug for API calls
        --token <TOKEN>
            Set the auth token for API calls
        --trace <TRACE>
            Specify a file to save a pprof trace
        --verbosity <COUNT>
            Verbosity level
        --dangerously-disable-package-manager-check
            Allow for missing `packageManager` in `package.json`
        --root-nrz-json <ROOT_NRZ_JSON>
            Use the `nrz.json` located at the provided path instead of one at the root of the repository
    -h, --help
            Print help (see more with '--help')

Test help flag for unlink command
  $ ${NRZ} unlink -h
  Unlink the current directory from your Vercel organization and disable Remote Caching
  
  Usage: nrz(\.exe)? unlink \[OPTIONS\] (re)
  
  Options:
        --target <TARGET>
            Specify what should be unlinked (default "remote cache") [default: remote-cache] [possible values: remote-cache, spaces]
        --version
            
        --skip-infer
            Skip any attempts to infer which version of Nrz the project is configured to use
        --no-update-notifier
            Disable the nrz update notification
        --api <API>
            Override the endpoint for API calls
        --color
            Force color usage in the terminal
        --cwd <CWD>
            The directory in which to run nrz
        --heap <HEAP>
            Specify a file to save a pprof heap profile
        --ui <UI>
            Specify whether to use the streaming UI or TUI [possible values: tui, stream, web]
        --login <LOGIN>
            Override the login endpoint
        --no-color
            Suppress color usage in the terminal
        --preflight
            When enabled, nrz will precede HTTP requests with an OPTIONS request for authorization
        --remote-cache-timeout <TIMEOUT>
            Set a timeout for all HTTP requests
        --team <TEAM>
            Set the team slug for API calls
        --token <TOKEN>
            Set the auth token for API calls
        --trace <TRACE>
            Specify a file to save a pprof trace
        --verbosity <COUNT>
            Verbosity level
        --dangerously-disable-package-manager-check
            Allow for missing `packageManager` in `package.json`
        --root-nrz-json <ROOT_NRZ_JSON>
            Use the `nrz.json` located at the provided path instead of one at the root of the repository
    -h, --help
            Print help (see more with '--help')

Test help flag for login command
  $ ${NRZ} login -h
  Login to your Vercel account
  
  Usage: nrz(\.exe)? login \[OPTIONS\] (re)
  
  Options:
        --sso-team <SSO_TEAM>
            
        --version
            
    -f, --force
            Force a login to receive a new token. Will overwrite any existing tokens for the given login url
        --skip-infer
            Skip any attempts to infer which version of Nrz the project is configured to use
        --no-update-notifier
            Disable the nrz update notification
        --api <API>
            Override the endpoint for API calls
        --color
            Force color usage in the terminal
        --cwd <CWD>
            The directory in which to run nrz
        --heap <HEAP>
            Specify a file to save a pprof heap profile
        --ui <UI>
            Specify whether to use the streaming UI or TUI [possible values: tui, stream, web]
        --login <LOGIN>
            Override the login endpoint
        --no-color
            Suppress color usage in the terminal
        --preflight
            When enabled, nrz will precede HTTP requests with an OPTIONS request for authorization
        --remote-cache-timeout <TIMEOUT>
            Set a timeout for all HTTP requests
        --team <TEAM>
            Set the team slug for API calls
        --token <TOKEN>
            Set the auth token for API calls
        --trace <TRACE>
            Specify a file to save a pprof trace
        --verbosity <COUNT>
            Verbosity level
        --dangerously-disable-package-manager-check
            Allow for missing `packageManager` in `package.json`
        --root-nrz-json <ROOT_NRZ_JSON>
            Use the `nrz.json` located at the provided path instead of one at the root of the repository
    -h, --help
            Print help (see more with '--help')

Test help flag for logout command
  $ ${NRZ} logout -h
  Logout to your Vercel account
  
  Usage: nrz(\.exe)? logout \[OPTIONS\] (re)
  
  Options:
        --invalidate
            Invalidate the token on the server
        --version
            
        --skip-infer
            Skip any attempts to infer which version of Nrz the project is configured to use
        --no-update-notifier
            Disable the nrz update notification
        --api <API>
            Override the endpoint for API calls
        --color
            Force color usage in the terminal
        --cwd <CWD>
            The directory in which to run nrz
        --heap <HEAP>
            Specify a file to save a pprof heap profile
        --ui <UI>
            Specify whether to use the streaming UI or TUI [possible values: tui, stream, web]
        --login <LOGIN>
            Override the login endpoint
        --no-color
            Suppress color usage in the terminal
        --preflight
            When enabled, nrz will precede HTTP requests with an OPTIONS request for authorization
        --remote-cache-timeout <TIMEOUT>
            Set a timeout for all HTTP requests
        --team <TEAM>
            Set the team slug for API calls
        --token <TOKEN>
            Set the auth token for API calls
        --trace <TRACE>
            Specify a file to save a pprof trace
        --verbosity <COUNT>
            Verbosity level
        --dangerously-disable-package-manager-check
            Allow for missing `packageManager` in `package.json`
        --root-nrz-json <ROOT_NRZ_JSON>
            Use the `nrz.json` located at the provided path instead of one at the root of the repository
    -h, --help
            Print help (see more with '--help')

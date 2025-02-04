Setup
  $ . ${TESTDIR}/../../../helpers/setup_integration_test.sh

Remove comments from our fixture nrz.json so we can do more jq things to it
  $ grep -v '^\s*//' nrz.json > nrz.json.1
  $ mv nrz.json.1 nrz.json
On Windows, convert CRLF line endings to LF Unix line endings, so hashes will match fixtures
  $ if [[ "$OSTYPE" == "msys" ]]; then dos2unix --quiet nrz.json; fi

  $ git commit -am "remove comments" > /dev/null

The fixture does not have a `remoteCache` config at all, output should be null
  $ cat nrz.json | jq .remoteCache
  null

Test that remote caching is enabled by default
  $ ${NRZ} run build --team=vercel --token=hi --output-logs=none 2>/dev/null | grep "Remote caching"
  \xe2\x80\xa2 Remote caching enabled (esc)

Set `remoteCache = {}` into nrz.json
  $ jq -r --argjson value "{}" '.remoteCache = $value' nrz.json > nrz.json.1
  $ mv nrz.json.1 nrz.json
On Windows, convert CRLF line endings to LF Unix line endings, so hashes will match fixtures
  $ if [[ "$OSTYPE" == "msys" ]]; then dos2unix --quiet nrz.json; fi
  $ git commit -am "add empty remote caching config" > /dev/null

Test that remote caching is still enabled
  $ ${NRZ} run build --team=vercel --token=hi --output-logs=none | grep "Remote caching"
  \xe2\x80\xa2 Remote caching enabled (esc)

Set `remoteCache = { enabled: false }` into nrz.json
  $ jq -r --argjson value false '.remoteCache.enabled = $value' nrz.json > nrz.json.1
  $ mv nrz.json.1 nrz.json
On Windows, convert CRLF line endings to LF Unix line endings, so hashes will match fixtures
  $ if [[ "$OSTYPE" == "msys" ]]; then dos2unix --quiet nrz.json; fi
  $ git commit -am "disable remote caching" > /dev/null

Test that this time, remote caching is disabled
  $ ${NRZ} run build --team=vercel --token=hi --output-logs=none | grep "Remote caching"
  \xe2\x80\xa2 Remote caching disabled (esc)

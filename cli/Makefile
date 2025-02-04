NRZ_VERSION = $(shell cat ../version.txt | sed -n '1 p')
NRZ_TAG = $(shell cat ../version.txt | sed -n '2 p')

CLI_DIR = $(shell pwd)

# This only builds JS packages
build:
	cd $(CLI_DIR)/../ && nrz build copy-schema \
		--filter=create-nrz \
		--filter=@nrz/codemod \
		--filter=nrz-ignore \
		--filter=@nrz/workspaces \
		--filter=@nrz/gen \
		--filter=eslint-plugin-nrz \
		--filter=eslint-config-nrz \
		--filter=@nrz/types

.PHONY: stage-release
stage-release:
	echo "Version: $(NRZ_VERSION)"
	echo "Tag: $(NRZ_TAG)"
	cat $(CLI_DIR)/../version.txt
	git diff -- $(CLI_DIR)/../version.txt
	git status
	@test "" = "`git cherry`" || (echo "Refusing to publish with unpushed commits" && false)

	# Stop if versions are not updated.
	@test "" != "`git diff -- $(CLI_DIR)/../version.txt`" || (echo "Refusing to publish with unupdated version.txt" && false)

	# Prepare the packages.
	cd $(CLI_DIR)/../packages/nrz && pnpm version "$(NRZ_VERSION)" --allow-same-version
	cd $(CLI_DIR)/../packages/create-nrz && pnpm version "$(NRZ_VERSION)" --allow-same-version
	cd $(CLI_DIR)/../packages/nrz-codemod && pnpm version "$(NRZ_VERSION)" --allow-same-version
	cd $(CLI_DIR)/../packages/nrz-ignore && pnpm version "$(NRZ_VERSION)" --allow-same-version
	cd $(CLI_DIR)/../packages/nrz-workspaces && pnpm version "$(NRZ_VERSION)" --allow-same-version
	cd $(CLI_DIR)/../packages/nrz-gen && pnpm version "$(NRZ_VERSION)" --allow-same-version
	cd $(CLI_DIR)/../packages/eslint-plugin-nrz && pnpm version "$(NRZ_VERSION)" --allow-same-version
	cd $(CLI_DIR)/../packages/eslint-config-nrz && pnpm version "$(NRZ_VERSION)" --allow-same-version
	cd $(CLI_DIR)/../packages/nrz-types && pnpm version "$(NRZ_VERSION)" --allow-same-version

	git checkout -b staging-$(NRZ_VERSION)
	git commit -anm "publish $(NRZ_VERSION) to registry"
	git tag "v$(NRZ_VERSION)"
	git push origin staging-$(NRZ_VERSION) --tags --force

.PHONY: publish-nrz
publish-nrz: build
	echo "Version: $(NRZ_VERSION)"
	echo "Tag: $(NRZ_TAG)"

	# Include the patch in the log.
	git format-patch HEAD~1 --stdout | cat

	npm config set --location=project "//registry.npmjs.org/:_authToken" $(NPM_TOKEN)

	# Publishes the native npm modules.
	# TODO: do this without goreleaser.
	goreleaser release --rm-dist -f combined-shim.yml $(SKIP_PUBLISH)

	# Split packing from the publish step so that npm locates the correct .npmrc file.
	cd $(CLI_DIR)/../packages/nrz && pnpm pack --pack-destination=$(CLI_DIR)/../
	cd $(CLI_DIR)/../packages/create-nrz && pnpm pack --pack-destination=$(CLI_DIR)/../
	cd $(CLI_DIR)/../packages/nrz-codemod && pnpm pack --pack-destination=$(CLI_DIR)/../
	cd $(CLI_DIR)/../packages/nrz-ignore && pnpm pack --pack-destination=$(CLI_DIR)/../
	cd $(CLI_DIR)/../packages/nrz-workspaces && pnpm pack --pack-destination=$(CLI_DIR)/../
	cd $(CLI_DIR)/../packages/nrz-gen && pnpm pack --pack-destination=$(CLI_DIR)/../
	cd $(CLI_DIR)/../packages/eslint-plugin-nrz && pnpm pack --pack-destination=$(CLI_DIR)/../
	cd $(CLI_DIR)/../packages/eslint-config-nrz && pnpm pack --pack-destination=$(CLI_DIR)/../
	cd $(CLI_DIR)/../packages/nrz-types && pnpm pack --pack-destination=$(CLI_DIR)/../

ifneq ($(SKIP_PUBLISH),--skip-publish)
	# Publish the remaining JS packages in order to avoid race conditions.
	cd $(CLI_DIR)/../
	npm publish -ddd --tag $(NRZ_TAG) $(CLI_DIR)/../nrz-$(NRZ_VERSION).tgz
	npm publish -ddd --tag $(NRZ_TAG) $(CLI_DIR)/../create-nrz-$(NRZ_VERSION).tgz
	npm publish -ddd --tag $(NRZ_TAG) $(CLI_DIR)/../nrz-codemod-$(NRZ_VERSION).tgz
	npm publish -ddd --tag $(NRZ_TAG) $(CLI_DIR)/../nrz-ignore-$(NRZ_VERSION).tgz
	npm publish -ddd --tag $(NRZ_TAG) $(CLI_DIR)/../nrz-workspaces-$(NRZ_VERSION).tgz
	npm publish -ddd --tag $(NRZ_TAG) $(CLI_DIR)/../nrz-gen-$(NRZ_VERSION).tgz
	npm publish -ddd --tag $(NRZ_TAG) $(CLI_DIR)/../eslint-plugin-nrz-$(NRZ_VERSION).tgz
	npm publish -ddd --tag $(NRZ_TAG) $(CLI_DIR)/../eslint-config-nrz-$(NRZ_VERSION).tgz
	npm publish -ddd --tag $(NRZ_TAG) $(CLI_DIR)/../nrz-types-$(NRZ_VERSION).tgz
endif

# use target fixture-<some directory under nrzrepo-tests/integration/fixtures> to set up the testbed directory
.PHONY=fixture-%
fixture-%:
	$(eval $@_FIXTURE := $(@:fixture-%=%))
	@echo "fixture setup $($@_FIXTURE)"
	rm -rf testbed
	mkdir -p testbed
	../nrzrepo-tests/helpers/setup_integration_test.sh ./testbed $($@_FIXTURE)


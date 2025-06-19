#!/usr/bin/env bash

echo "Initializing"
read_file_and_export() {
	if [ -n "${!1}" ]; then
		content="$(cat "${!1}")"
		export "$2"="${content}"
		unset "$1"
	fi
}


echo "Running: node /usr/src/app/dist/main $@"
exec node /usr/src/app/dist/main "$@"

#!/bin/bash
set -e

PGPASS_DST="${PGADMIN_HOME}/pgpass"
envsubst <${PGADMIN_HOME}/pgpass.template >"$PGPASS_DST"
chmod 600 "$PGPASS_DST"

envsubst <${PGADMIN_HOME}/servers.json.template >${PGADMIN_HOME}/servers.json
export PGADMIN_SERVER_JSON_FILE=${PGADMIN_HOME}/servers.json
export PGPASSFILE="$PGPASS_DST"

exec /entrypoint.sh

FROM dpage/pgadmin4
USER root

# Installer envsubst, quel que soit le système
RUN set -e; \
    if command -v apk >/dev/null; then apk add --no-cache gettext; \
    else apt-get update && apt-get install -y --no-install-recommends gettext-base && rm -rf /var/lib/apt/lists/*; fi

ENV PGADMIN_HOME=/var/lib/pgadmin
ARG PG_UID=5050 PG_GID=5050

COPY --chown=${PG_UID}:${PG_GID} entrypoint.sh /usr/local/bin/entrypoint.sh
COPY --chown=${PG_UID}:${PG_GID} servers.json.template pgpass.template ${PGADMIN_HOME}/

RUN chmod 755 /usr/local/bin/entrypoint.sh \
    && chmod 600 ${PGADMIN_HOME}/*.template

USER ${PG_UID}
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
EXPOSE 80

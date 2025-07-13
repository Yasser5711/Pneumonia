FROM dpage/pgadmin4

USER root

COPY entrypoint.sh /entrypoint.sh
COPY servers.json.template /servers.json.template
COPY pgpass.template /pgpass.template

# FIX: Convert Windows line endings (\r\n) to Unix (\n)
# and make the script executable.
RUN sed -i 's/\r$//' /entrypoint.sh && chmod +x /entrypoint.sh

USER pgadmin

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
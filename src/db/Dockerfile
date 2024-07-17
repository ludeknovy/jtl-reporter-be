FROM novyl/jtl-reporter-db:latest
ENV POSTGRES_DB jtl_report
COPY schema.sql /docker-entrypoint-initdb.d/

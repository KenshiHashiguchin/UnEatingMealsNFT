FROM nginx:1.19.3-alpine

ARG UID=1000
ARG GID=1000
ARG USERNAME=app
ARG GROUPNAME=app

COPY ./containers/nginx/nginx.conf /etc/nginx/

RUN apk update \
    && apk upgrade \
    && apk --update add logrotate \
    && apk add --no-cache openssl \
    && apk add --no-cache bash

RUN apk add --no-cache curl

# Create 'messages' file used from 'logrotate'
RUN touch /var/log/messages

# Copy 'logrotate' config file
COPY ./containers/nginx/logrotate/nginx /etc/logrotate.d/

ADD --chown=nginx:nginx ./containers/nginx/sites/ /etc/nginx/sites-available
ADD --chown=nginx:nginx  ./containers/nginx/startup.sh /opt/startup.sh

RUN sed -i 's/\r//g' /opt/startup.sh
CMD ["/bin/bash", "/opt/startup.sh"]

RUN ( addgroup -g ${GID} ${GROUPNAME} || true ) \
    && ( adduser -D -u ${UID} -G ${GROUPNAME} ${USERNAME} || true )


EXPOSE 8080 443

WORKDIR /var/www/application



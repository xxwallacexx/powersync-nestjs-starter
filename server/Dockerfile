# Development build stage
FROM node:22-bookworm AS dev

#RUN apk add --no-cache tini
RUN apt-get update && \
    apt-get install tini 

WORKDIR /usr/src/app
COPY server/package.json server/package-lock.json ./
RUN npm ci
ENV PATH="${PATH}:/usr/src/app/bin" \
    ENV=development 
ENTRYPOINT ["tini", "--", "/bin/sh"]

# Production build stage
FROM dev AS prod

COPY server .
RUN npm run build
# Prune dev dependencies carefully
#RUN npm prune --production

# Final production image
FROM node:22-bookworm

# Install runtime dependencies for bcrypt and tini
# RUN apk add --no-cache tini bash 
RUN apt-get update && \
    apt-get install tini 

WORKDIR /usr/src/app
ENV ENV=production

COPY --from=prod /usr/src/app/node_modules ./node_modules
COPY --from=prod /usr/src/app/dist ./dist
COPY --from=prod /usr/src/app/bin ./bin
COPY server/package.json server/package-lock.json ./
COPY server/start*.sh ./

EXPOSE 4040
ENTRYPOINT ["tini", "--", "/bin/bash"]
CMD ["start.sh"]

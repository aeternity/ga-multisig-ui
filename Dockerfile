FROM node:18.13.0 as builder

RUN mkdir -p /home/node/app
WORKDIR /home/node/app
COPY package.json package-lock.json /home/node/app/
RUN chown -R node:node /home/node/

USER node

RUN npm ci
COPY --chown=node:node . /home/node/app
RUN npm run build

FROM nginx:1.23.1-alpine
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /home/node/app/dist /usr/share/nginx/html

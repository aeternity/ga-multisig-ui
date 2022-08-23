FROM node:18.7.0 as builder

RUN mkdir -p /home/node/app
WORKDIR /home/node/app
COPY package.json yarn.lock /home/node/app/
RUN chown -R node:node /home/node/

USER node

RUN yarn install --frozen-lockfile
COPY --chown=node:node . /home/node/app
RUN yarn build

FROM nginx:1.23.1-alpine
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /home/node/app/dist /usr/share/nginx/html

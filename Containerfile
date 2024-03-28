FROM docker.io/denoland/deno AS builder
COPY . /app
WORKDIR /app

ARG GIT_REVISION
ENV DENO_DEPLOYMENT_ID=${GIT_REVISION}
RUN deno cache main.ts && deno task build

FROM docker.io/denoland/deno:distroless
COPY --from=builder /app /app
COPY --from=builder /deno-dir /deno-dir
WORKDIR /app
EXPOSE 8000
CMD ["run", "-A", "main.ts"]

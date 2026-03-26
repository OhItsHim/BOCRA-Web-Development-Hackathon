FROM rust:1.88-slim as builder
WORKDIR /app
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*
COPY Cargo.toml ./
RUN cargo generate-lockfile
RUN mkdir -p src/bin \
    && echo "fn main() {}" > src/main.rs \
    && echo "fn main() {}" > src/bin/seed.rs
RUN cargo build --release
RUN rm -f target/release/deps/bocra_api*
COPY src ./src
COPY migrations ./migrations
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
RUN cargo build --release

FROM debian:bookworm-slim
WORKDIR /app
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/bocra-api .
COPY --from=builder /app/migrations ./migrations
EXPOSE 8080
CMD ["./bocra-api"]

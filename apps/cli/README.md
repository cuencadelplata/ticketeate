# Ticketeate CLI

CLI basado en Rust para desplegar y administrar microservicios de Ticketeate :D

## requisitos

Instalación de Rust

1. **Install Rust**: Visit [rustup.rs](https://rustup.rs/) and follow the installation instructions for Windows.
2. **Verify installation**: Run `cargo --version` to ensure Rust is properly installed.

## Building

### usando turborepo

```bash
# From the project root
turbo run cli#build
```

### usando cargo

```bash
# From the apps/cli directory
cargo build

# For release build
cargo build --release
```

## uso

### deploy micro

```bash
# build cli
cargo build --release

# deploy a aws lambda (elige el micro)
# opciones: events | users | producers | checkout
./target/release/cli.exe deploy-micro --micro events --image-uri "123456789.dkr.ecr.us-east-1.amazonaws.com/svc-events:latest"
```

### deploy frontend

```bash
# deploy next app
./target/release/cli.exe deploy-front --host "ticketeate.com"
```

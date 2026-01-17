# 🚀 Quick Start - Monitoring Stack

## Start Monitoring Services

```bash
cd monitoring
docker compose up -d
```

## Check Status

```bash
docker compose ps
```

## Access Services

- **Grafana**: http://localhost:3000 (admin/admin123)
- **Prometheus**: http://localhost:9090
- **cAdvisor**: http://localhost:8080

## View Logs

```bash
docker compose logs -f
```

## Stop Services

```bash
docker compose down
```

## Complete Reset

```bash
docker compose down -v
```

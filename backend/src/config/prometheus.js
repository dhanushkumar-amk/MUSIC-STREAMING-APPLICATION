import client from "prom-client";

if (!global.__prometheus) {
  const register = new client.Registry();

  // Collect all default Node.js + process metrics
  client.collectDefaultMetrics({
    register,
    labels: { app: "spotify-backend" }
  });

  // Store Prometheus registry globally to avoid re-registering
  global.__prometheus = { register };
}

export default global.__prometheus.register;

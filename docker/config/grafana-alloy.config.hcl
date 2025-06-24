prometheus.scrape "api" {
  targets =  [{
        __address__ = "server:8081",
        cluster     = "localhost",
    }]
  job_name        = "api"
  forward_to     = [prometheus.remote_write.production.receiver]
}

prometheus.scrape "service" {
  targets =  [{
        __address__ = "server:8082",
        cluster     = "localhost",
    }]
  job_name        = "service"
  forward_to     = [prometheus.remote_write.production.receiver]
}

prometheus.remote_write "production" {
  endpoint {
    url =  env("GRAFANA_CLOUD_REMOTE_WRITE_URL")
    basic_auth {
      username = env("GRAFANA_CLOUD_PROMETHEUS_USERNAME")
      password = env("GRAFANA_CLOUD_PROMETHEUS_API_KEY") 
    }
  }
}

otelcol.receiver.otlp "default" {
   http {}
   grpc {}
   output {
      traces  = [
	otelcol.processor.batch.default.input,
      ]
   }
}

otelcol.processor.batch "default" {
   output {
      traces  = [otelcol.exporter.otlphttp.default.input]
  }
}

otelcol.exporter.otlphttp "default" {
    client {
	endpoint = env("GRAFANA_CLOUD_OTLP_ENDPOINT") 
	auth     = otelcol.auth.basic.creds.handler
  }
}

otelcol.auth.basic "creds" {
    username = env("GRAFANA_CLOUD_OTLP_USERNAME") 
    password = env("GRAFANA_CLOUD_OTLP_PASSWORD")
}

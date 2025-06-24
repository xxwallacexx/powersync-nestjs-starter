prometheus.scrape "api" {
  targets =  [{
        __address__ = "server:8081",
        cluster     = "localhost",
    }]
  job_name        = "dev-api"
  forward_to     = [prometheus.remote_write.dev.receiver]
}

prometheus.scrape "service" {
  targets =  [{
        __address__ = "server:8082",
        cluster     = "localhost",
    }]
  job_name        = "dev-service"
  forward_to     = [prometheus.remote_write.dev.receiver]
}

prometheus.remote_write "dev" {
  endpoint {
    url =  env("GRAFANA_CLOUD_REMOTE_WRITE_URL")
    basic_auth {
      username = env("GRAFANA_CLOUD_PROMETHEUS_USERNAME")
      password = env("GRAFANA_CLOUD_PROMETHEUS_API_KEY") 
    }
  }
}

otelcol.receiver.otlp "dev" {
   http {}
   grpc {}
   output {
      traces  = [
	  otelcol.processor.batch.dev.input,
      ]
   }
}

otelcol.processor.batch "dev" {
   output {
     traces  = [otelcol.exporter.otlphttp.dev.input]
  }
}

otelcol.exporter.otlphttp "dev" {
    client {
      endpoint = env("GRAFANA_CLOUD_OTLP_ENDPOINT") 
      auth     = otelcol.auth.basic.creds.handler
    }
}

otelcol.auth.basic "creds" {
    username = env("GRAFANA_CLOUD_OTLP_USERNAME") 
    password = env("GRAFANA_CLOUD_OTLP_PASSWORD")
}

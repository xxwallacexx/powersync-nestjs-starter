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
  forward_to     = [prometheus.remote_write.dev.receiver]
}

prometheus.remote_write "production" {
  endpoint {
    url =  env("GRAFANA_CLOUD_REMOTE_WRITE_URL")
    basic_auth {
      username = env("GRAFANA_CLOUD_USERNAME")
      password = env("GRAFANA_CLOUD_API_KEY") 
    }
  }
}



# Sherlock Logs

Automated monitoring and centralized logging for a sample application running across two Ubuntu VMs.

The app VM runs the Node.js application, Node Exporter, cAdvisor, and Filebeat. The monitoring VM runs Prometheus, Grafana, Elasticsearch, Logstash, Kibana, Node Exporter, the Elasticsearch exporter, and Filebeat.

## Requirements

- VirtualBox
- Vagrant
- Ansible

## Setup

Create both VMs and provision the complete stack:

```sh
vagrant up
```

Reapply the configuration after making changes:

```sh
vagrant provision monitoring
```

Stop or remove the environment:

```sh
vagrant halt
vagrant destroy
```

## Services

| Service             | URL                               | Default credentials              |
| ------------------- | --------------------------------- | -------------------------------- |
| Application         | http://192.168.56.10:3000         | None                             |
| Application metrics | http://192.168.56.10:3000/metrics | None                             |
| cAdvisor            | http://192.168.56.10:8080         | None                             |
| Prometheus          | http://192.168.56.20:9090         | None                             |
| Grafana             | http://192.168.56.20:3000         | `admin` / `admin` on first login |
| Kibana              | http://192.168.56.20:5601         | None                             |

These addresses are intended for the local VirtualBox private network. Elasticsearch and Logstash are not exposed as public user interfaces.

## Dashboards

Grafana provisions dashboards for VM performance, Docker containers, and application performance. Kibana imports dashboards for system, application, and Docker logs.

The application exposes request counts, request-duration histograms, default Node.js process metrics, and the custom `app_health_checks_total` metric. Its JSON stdout and stderr logs are collected from Docker by Filebeat, parsed by Logstash, and stored in daily `sherlock-logs-*` Elasticsearch indices.

## Alerts

Prometheus and Grafana provision alerts for high VM CPU and memory usage, low disk space, unreachable VMs, frequent container restarts, high container memory usage, and unhealthy Elasticsearch cluster status. Grafana-managed rules are available in the `Sherlock Logs` alert folder, while Prometheus-managed rule state remains visible in the Prometheus UI.

## Validation

```sh
vagrant validate
ansible-playbook -i ansible/inventory.yaml ansible/playbook.yaml --syntax-check
```

The Jenkins pipeline runs both validation commands and deploys the environment with `vagrant up --provision`.

Useful runtime checks:

```sh
vagrant status
curl http://192.168.56.10:3000/health
curl http://192.168.56.20:9090/-/ready
curl http://192.168.56.20:3000/api/health
curl http://192.168.56.20:5601/api/status
```

If the private-network addresses are unavailable, verify that VirtualBox created the host-only network and that both VMs have their `192.168.56.x` interfaces.

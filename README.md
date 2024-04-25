<div align="center">
  <img src="static/title.webp" />
  <h1>Kaleidos</h1>
</div>

[![Made with Fresh](https://fresh.deno.dev/fresh-badge-dark.svg)](https://fresh.deno.dev)

## Usage

### Container (Podman)

1. Create a directory to store the configuration file and other data.

   ```shellsession
   $ sudo mkdir -p /opt/container/kaleidos/data
   $ sudo wget -P /opt/container/kaleidos https://raw.githubusercontent.com/BioniCosmos/kaleidos/master/config.ts
   ```

2. Put the following into `/etc/systemd/system/container-kaleidos.service`.

   ```ini
   [Unit]
   Description=Podman container-kaleidos.service
   Documentation=man:podman-generate-systemd(1)
   Wants=network-online.target
   After=network-online.target
   RequiresMountsFor=%t/containers

   [Service]
   Environment=PODMAN_SYSTEMD_UNIT=%n
   Restart=on-failure
   TimeoutStopSec=70
   ExecStartPre=/bin/rm \
     -f %t/%n.ctr-id
   ExecStart=/usr/bin/podman run \
     --cidfile=%t/%n.ctr-id \
     --cgroups=no-conmon \
     --rm \
     --sdnotify=conmon \
     --replace \
     -d \
     --name kaleidos \
     -p 80:8000 \
     -v /opt/container/kaleidos/config.ts:/app/config.ts \
     -v /opt/container/kaleidos/data:/app/data \
     ghcr.io/bionicosmos/kaleidos
   ExecStop=/usr/bin/podman stop \
     --ignore -t 10 \
     --cidfile=%t/%n.ctr-id
   ExecStopPost=/usr/bin/podman rm \
     -f \
     --ignore -t 10 \
     --cidfile=%t/%n.ctr-id
   Type=notify
   NotifyAccess=all

   [Install]
   WantedBy=default.target
   ```

> [!NOTE]
> This file is generated with `podman generate systemd`.

3. Start the service.

   ```shellsession
   $ sudo systemctl daemon-reload
   $ sudo systemctl --now enable container-kaleidos.service
   ```

### Git

1. Clone the repository to your server.

   ```shellsession
   $ git clone https://github.com/BioniCosmos/kaleidos.git
   $ cd kaleidos
   $ git checkout v2.0.1
   ```

2. Modify the configuration file. (`config.ts` for Kaleidos and `fresh.config.ts` for Fresh)
3. Start Kaleidos.

   ```shellsession
   $ deno run -A main.ts
   ```

## Upgrade from v1 to v2

1. Pull the latest image.

   ```shellsession
   $ sudo podman pull ghcr.io/bionicosmos/kaleidos:latest
   ```

2. Run the migration script to update the database.

   ```shellsession
   $ sudo podman run \
     --rm \
     -v /opt/container/kaleidos/config.ts:/app/config.ts \
     -v /opt/container/kaleidos/data:/app/data \
     kaleidos \
     run -A migration.ts
   ```

3. Restart the container.

   ```shellsession
   $ sudo systemctl restart container-kaleidos.service
   ```

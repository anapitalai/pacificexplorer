Deployment notes for Pacific Explorer

This folder contains scripts to package and deploy the application to the remote server (170.64.195.201).

quick-deploy.sh
- Creates a tar.gz archive of the `pacific-explorer/` folder and uploads it to `/opt/` on the remote server as `pacific-explorer.tar.gz`.
- Upload step now includes:
  - 3 attempts using `scp` (with compression)
  - Exponential backoff between attempts
  - `rsync` fallback if `scp` fails and `rsync` is available locally
- After upload the script SSHes to the server, backs up any existing deployment, extracts the archive, and runs `./scripts/deploy.sh` on the server.

package-for-deploy.sh
- Creates the same archive but is intended for manual transfer when SSH keys are not available.

Troubleshooting
- If upload fails and you don't have `rsync` installed locally, transfer manually using:

  scp pacific-explorer.tar.gz root@170.64.195.201:/opt/

- If you're prompted for a password repeatedly, set up SSH keys with:

  ssh-keygen -t ed25519 -C "your_email@example.com"
  ssh-copy-id root@170.64.195.201

- To debug on the server:

  ssh root@170.64.195.201
  cd /opt/pacific-explorer
  docker-compose logs -f app

Notes
- The script assumes Docker is available or will be installed on the remote host (it attempts to install Docker if missing).
- Keep `pacific-explorer/.env.production` updated before deploying.

#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"

CONFIG_FILE="${DEPLOY_CONFIG_FILE:-${PROJECT_ROOT}/.deploy.prod.env}"
TIMESTAMP="$(date +%Y%m%d%H%M%S)"
ARCHIVE_FILE=""
STAGE_DIR=""

log() {
  printf '[deploy] %s\n' "$*"
}

die() {
  printf '[deploy] ERROR: %s\n' "$*" >&2
  exit 1
}

is_enabled() {
  case "${1:-}" in
    1 | true | TRUE | yes | YES | on | ON) return 0 ;;
    *) return 1 ;;
  esac
}

quote() {
  printf '%q' "$1"
}

cleanup() {
  if [[ -n "${ARCHIVE_FILE}" && -f "${ARCHIVE_FILE}" ]]; then
    rm -f "${ARCHIVE_FILE}"
  fi
  if [[ -n "${STAGE_DIR}" && -d "${STAGE_DIR}" ]]; then
    rm -rf "${STAGE_DIR}"
  fi
}
trap cleanup EXIT

require_command() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"
}

tar_supports() {
  tar "$1" -cf /dev/null --files-from /dev/null >/dev/null 2>&1
}

if [[ ! -f "${CONFIG_FILE}" ]]; then
  die "Missing deploy config: ${CONFIG_FILE}. Create .deploy.prod.env first."
fi

set -a
# shellcheck disable=SC1090
. "${CONFIG_FILE}"
set +a

: "${REMOTE_HOST:?REMOTE_HOST is required in ${CONFIG_FILE}}"
: "${REMOTE_USER:?REMOTE_USER is required in ${CONFIG_FILE}}"

REMOTE_PORT="${REMOTE_PORT:-22}"
REMOTE_APP_DIR="${REMOTE_APP_DIR:-/root/web/resume-editor}"
REMOTE_ENV_FILE="${REMOTE_ENV_FILE:-/root/envs/resume-editor/.env}"
PM2_APP_NAME="${PM2_APP_NAME:-ResumeEditor}"
APP_PORT="${APP_PORT:-4787}"
HEALTHCHECK_PATH="${HEALTHCHECK_PATH:-/api/health}"

RUN_INSTALL="${RUN_INSTALL:-true}"
RUN_LINT="${RUN_LINT:-false}"
RUN_BUILD="${RUN_BUILD:-true}"
RUN_REMOTE_INSTALL="${RUN_REMOTE_INSTALL:-true}"

LOCAL_INSTALL_CMD="${LOCAL_INSTALL_CMD:-npm install}"
LOCAL_BUILD_CMD="${LOCAL_BUILD_CMD:-env NODE_OPTIONS=--max-old-space-size=4096 npm run build}"
REMOTE_INSTALL_CMD="${REMOTE_INSTALL_CMD:-npm install --production=false}"

REMOTE_ARCHIVE="/tmp/resume-editor-${TIMESTAMP}.tar.gz"
SSH_TARGET="${REMOTE_USER}@${REMOTE_HOST}"
SSH_ARGS=(-p "${REMOTE_PORT}" -o BatchMode=yes -o ConnectTimeout=15)
SCP_ARGS=(-P "${REMOTE_PORT}" -o BatchMode=yes -o ConnectTimeout=15)

require_command bash
require_command ssh
require_command scp
require_command tar
require_command node
require_command npm

cd "${PROJECT_ROOT}"

log "Deploying resume-editor to ${REMOTE_APP_DIR}"

if is_enabled "${RUN_INSTALL}"; then
  log "Running local install"
  bash -lc "${LOCAL_INSTALL_CMD}"
fi

if is_enabled "${RUN_LINT}"; then
  log "Running local lint"
  pnpm lint || true
fi

if is_enabled "${RUN_BUILD}"; then
  log "Running local build"
  bash -lc "${LOCAL_BUILD_CMD}"
fi

[[ -d .output/server ]] || die "Missing .output/server. Run a Nuxt build before deploying."
[[ -f .output/nitro.json ]] || die "Missing .output/nitro.json. Run a Nuxt build before deploying."

STAGE_DIR="$(mktemp -d -t resume-editor-deploy-stage.XXXXXX)"
ARCHIVE_FILE="$(mktemp -t resume-editor-deploy.XXXXXX.tar.gz)"
cp -R .output/server "${STAGE_DIR}/server"
if [[ -d .output/public ]]; then
  cp -R .output/public "${STAGE_DIR}/public"
fi
cp .output/nitro.json "${STAGE_DIR}/nitro.json"
cp package.json package-lock.json pm2.config.json pm2.preload.cjs "${STAGE_DIR}/"
cp -R templates "${STAGE_DIR}/templates"

log "Packing build artifact"
TAR_EXTRA_ARGS=()
if tar_supports --no-xattrs; then
  TAR_EXTRA_ARGS+=(--no-xattrs)
fi
if tar_supports --no-mac-metadata; then
  TAR_EXTRA_ARGS+=(--no-mac-metadata)
fi

COPYFILE_DISABLE=1 COPY_EXTENDED_ATTRIBUTES_DISABLE=1 tar \
  "${TAR_EXTRA_ARGS[@]}" \
  --exclude='._*' \
  --exclude='.DS_Store' \
  -czf "${ARCHIVE_FILE}" \
  -C "${STAGE_DIR}" \
  server \
  public \
  nitro.json \
  package.json \
  package-lock.json \
  pm2.config.json \
  pm2.preload.cjs \
  templates

log "Uploading artifact"
scp "${SCP_ARGS[@]}" "${ARCHIVE_FILE}" "${SSH_TARGET}:${REMOTE_ARCHIVE}"

log "Installing artifact on remote host"
ssh "${SSH_ARGS[@]}" "${SSH_TARGET}" \
  "REMOTE_APP_DIR=$(quote "${REMOTE_APP_DIR}") \
  REMOTE_ENV_FILE=$(quote "${REMOTE_ENV_FILE}") \
  REMOTE_ARCHIVE=$(quote "${REMOTE_ARCHIVE}") \
  PM2_APP_NAME=$(quote "${PM2_APP_NAME}") \
  APP_PORT=$(quote "${APP_PORT}") \
  HEALTHCHECK_PATH=$(quote "${HEALTHCHECK_PATH}") \
  RUN_REMOTE_INSTALL=$(quote "${RUN_REMOTE_INSTALL}") \
  REMOTE_INSTALL_CMD=$(quote "${REMOTE_INSTALL_CMD}") \
  bash -s" <<'REMOTE_SCRIPT'
set -euo pipefail

log() {
  printf '[deploy:remote] %s\n' "$*"
}

die() {
  printf '[deploy:remote] ERROR: %s\n' "$*" >&2
  exit 1
}

is_enabled() {
  case "${1:-}" in
    1 | true | TRUE | yes | YES | on | ON) return 0 ;;
    *) return 1 ;;
  esac
}

command -v node >/dev/null 2>&1 || die "Missing required command: node"
command -v npm >/dev/null 2>&1 || die "Missing required command: npm"
command -v pm2 >/dev/null 2>&1 || die "Missing required command: pm2"
command -v curl >/dev/null 2>&1 || die "Missing required command: curl"
command -v tar >/dev/null 2>&1 || die "Missing required command: tar"
[[ -f "${REMOTE_ARCHIVE}" ]] || die "Uploaded archive not found: ${REMOTE_ARCHIVE}"
[[ -f "${REMOTE_ENV_FILE}" ]] || die "Runtime env file not found: ${REMOTE_ENV_FILE}"

mkdir -p "${REMOTE_APP_DIR}"
cd "${REMOTE_APP_DIR}"

log "Replacing app files"
find . -mindepth 1 -maxdepth 1 ! -name node_modules -exec rm -rf {} +
tar -xzf "${REMOTE_ARCHIVE}" -C "${REMOTE_APP_DIR}"
find "${REMOTE_APP_DIR}" -name '._*' -delete
rm -f "${REMOTE_ARCHIVE}"

if is_enabled "${RUN_REMOTE_INSTALL}"; then
  log "Installing remote dependencies"
  bash -lc "${REMOTE_INSTALL_CMD}"
fi

log "Restarting PM2 app"
pm2 startOrReload pm2.config.json --only "${PM2_APP_NAME}" --update-env
pm2 save

log "Waiting for healthcheck"
for attempt in $(seq 1 20); do
  if curl -fsS "http://127.0.0.1:${APP_PORT}${HEALTHCHECK_PATH}" >/dev/null; then
    log "Healthcheck passed"
    exit 0
  fi
  sleep 1
done

die "Healthcheck failed: http://127.0.0.1:${APP_PORT}${HEALTHCHECK_PATH}"
REMOTE_SCRIPT

log "Deployment finished"

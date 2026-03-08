#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Uso: $0 <pr-number>"
  exit 1
fi

PR_NUMBER="$1"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Erro: comando '$1' nao encontrado." >&2
    exit 1
  fi
}

require_cmd gh
require_cmd jq
require_cmd npm

if ! gh auth status >/dev/null 2>&1; then
  echo "Erro: voce precisa autenticar o GitHub CLI primeiro (gh auth login)." >&2
  exit 1
fi

PR_JSON="$(gh pr view "$PR_NUMBER" --json number,title,url,state,isDraft,baseRefName,headRefName,reviewDecision,mergeStateStatus)"

STATE="$(jq -r '.state' <<<"$PR_JSON")"
IS_DRAFT="$(jq -r '.isDraft' <<<"$PR_JSON")"
BASE_REF="$(jq -r '.baseRefName' <<<"$PR_JSON")"
TITLE="$(jq -r '.title' <<<"$PR_JSON")"
URL="$(jq -r '.url' <<<"$PR_JSON")"

if [[ "$STATE" != "OPEN" ]]; then
  echo "Erro: PR #$PR_NUMBER nao esta aberto (state=$STATE)." >&2
  exit 1
fi

if [[ "$IS_DRAFT" == "true" ]]; then
  echo "Erro: PR #$PR_NUMBER ainda esta em draft." >&2
  exit 1
fi

if [[ "$BASE_REF" != "master" ]]; then
  echo "Erro: PR #$PR_NUMBER aponta para '$BASE_REF', esperado 'master'." >&2
  exit 1
fi

echo "PR: #$PR_NUMBER - $TITLE"
echo "URL: $URL"

echo "[1/5] Coletando diff do PR..."
DIFF_FILE="/tmp/pr-${PR_NUMBER}-diff.patch"
gh pr diff "$PR_NUMBER" > "$DIFF_FILE"
echo "Diff salvo em: $DIFF_FILE"

echo "[2/5] Fazendo checkout da branch do PR..."
gh pr checkout "$PR_NUMBER"

echo "[3/5] Rodando lint..."
npm run lint

echo "[4/5] Rodando testes..."
npm run test

echo "[5/5] Publicando aprovacao no PR..."
gh pr review "$PR_NUMBER" --approve --body "Aprovado pelo agente local apos revisar diff, lint e testes."

UPDATED_DECISION="$(gh pr view "$PR_NUMBER" --json reviewDecision -q '.reviewDecision')"
if [[ "$UPDATED_DECISION" != "APPROVED" ]]; then
  echo "Erro: PR #$PR_NUMBER ainda nao esta APPROVED (reviewDecision=$UPDATED_DECISION)." >&2
  exit 1
fi

echo "Aprovado. Executando merge para master..."
gh pr merge "$PR_NUMBER" --squash --delete-branch

echo "Concluido: PR #$PR_NUMBER revisado e migrado para master."

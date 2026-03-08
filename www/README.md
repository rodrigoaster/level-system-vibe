# Agentes Locais (`www/`)

Este diretório centraliza prompts de agentes usados pelas integrações locais.

## Agente de revisão de PR

Arquivo:
- `www/pr-review-agent.md`

Objetivo:
- Revisar Pull Requests com foco em qualidade de código.

Ferramentas permitidas:
- `read_file`
- `search_code`
- `run_tests`
- `read_diff`

## Agente de validação de branch e criação de PR

Arquivo:
- `www/branch-pr-agent.md`

Objetivo:
- Validar branch (lint + testes unitários) e abrir PR para `master` apenas quando aprovado.

Ferramentas permitidas:
- `read_file`
- `search_code`
- `run_tests`
- `read_diff`

## Como é usado nas integrações

- Codex: configurado em `AGENTS.md` para usar `www/pr-review-agent.md` em tarefas de review de PR.
- Claude Code: configurado em `CLAUDE.md` para usar `www/pr-review-agent.md` em tarefas de review de PR.
- Codex: configurado em `AGENTS.md` para usar `www/branch-pr-agent.md` em tarefas de validação de branch e abertura de PR.
- Claude Code: configurado em `CLAUDE.md` para usar `www/branch-pr-agent.md` em tarefas de validação de branch e abertura de PR.

## Alias global no WSL

Comando:
- `pr-agent <numero-do-pr>`

O comando:
- coleta o diff da PR;
- faz checkout da branch da PR;
- executa `npm run lint` e `npm run test`;
- publica aprovação no GitHub;
- faz merge `squash` para `master` e remove a branch remota.

Exemplo:
- `pr-agent 123`

## Manutenção

- Mantenha os prompts fonte em `www/pr-review-agent.md` e `www/branch-pr-agent.md`.
- Evite duplicar instruções em `AGENTS.md` e `CLAUDE.md`; eles devem apenas referenciar os arquivos de agente.

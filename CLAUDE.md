# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

Next.js 16.1.6 scaffold is in place. No leveling system logic has been written yet.

**Stack:** Next.js 16.1.6, React 19.2.3, TypeScript, Tailwind CSS v4

**Source files:**
- `src/app/layout.tsx` — root layout
- `src/app/page.tsx` — placeholder "Hello world!"
- `src/app/globals.css` — global styles

## Getting Started

Before writing leveling system code, clarify with the user:
- What the leveling system is for (game, app, productivity tool, etc.)
- Whether data should be persisted (DB, localStorage, etc.)
- Any UI/UX preferences or design direction

## Notes

- Aider was used previously but ran into API credit issues without producing any code
- `npm run dev` starts the dev server on the default Next.js port

# Resumo Completo do Projeto — Level System

## Visão Geral

**Level System** é um sistema de progressão profissional gamificado, construído como uma SaaS multi-usuário. O objetivo é transformar rotina em progresso mensurável, com XP, níveis, missões semanais, habilidades e conquistas.

**Branch atual:** `feature/feat_new_workflows`
**Stack principal:** Next.js 14 + TypeScript + Supabase + Zustand + Tailwind CSS

---

## Tech Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js (App Router) | ^14.2.0 |
| Linguagem | TypeScript | ^5.4.0 |
| UI | React | ^18.3.0 |
| Estilização | Tailwind CSS | ^3.4.0 |
| Animações | Framer Motion | ^11.0.0 |
| Ícones | Lucide React | ^0.370.0 |
| Backend/Auth/DB | Supabase (@supabase/supabase-js + @supabase/ssr) | ^2.95.3 / ^0.8.0 |
| Datas | date-fns | ^3.6.0 |
| Fontes | Inter + Space Mono (via next/font) | — |
| PWA | Service Worker custom | — |
| Idioma | Português (pt-BR) | — |

## Funcionalidades

### 1. Sistema de Progressão XP / Níveis

- **15 níveis** organizados em 5 tiers: Bronze → Silver → Gold → Diamond → Master
- Fórmula de XP por nível: `50 * (level - 1)²`
- Cada tier tem esquema de cores próprio (accent, glow, badge, ring)
- `getRank(xp)` calcula nível e tier atual em tempo real

| Tier | Níveis | Cor |
|---|---|---|
| Bronze | 1–4 | Cinza azulado (#8899b0) |
| Silver | 5–8 | Azul (#4d8ef7) |
| Gold | 9–12 | Roxo (#9b6ff8) |
| Diamond | 13–16 | Amarelo (#f7b740) |
| Master | 17+ | Vermelho (#f05555) |

### 2. Atividades e Categorias

- **7 categorias** com XP variável:

| Categoria | Ícone | XP |
|---|---|---|
| Fitness | 💪 | 30 |
| Nutrition | 🥗 | 25 |
| Delivery | 📦 | 40 |
| Learning | 📚 | 25 |
| Spiritual | 🧘 | 20 |
| Social | 🤝 | 30 |
| Creativity | 🎨 | 35 |

- Registro com categoria + nota opcional
- Log de atividades indexado por data e semana
- Suporte a categorias legadas (migração de dados antigos)

### 3. Missões Semanais

- Criação de missões por dia da semana (0=Seg a 6=Dom)
- Missões **fixas** (repetem semanalmente) ou **únicas** (excluídas após completar)
- Completar missão cria uma `ActivityEntry` automaticamente
- HabitGrid: grade visual 7 dias × N missões com células de status
- Modal `AddMissionModal` para criação rápida

### 4. Streak Diário

- Incrementa se a última atividade foi **ontem**
- Mantém se já houve atividade **hoje**
- Reseta para 1 caso contrário
- Exibido no header com ícone de chama

### 5. Bônus Semanais

- 3 thresholds configurados no banco:
  - 50+ XP → +10 XP de bônus
  - 100+ XP → +25 XP de bônus
  - 200+ XP → +50 XP de bônus
- Bônus aplicado ao **fechar semana**
- Barra de progresso visual no componente `WeeklyProgress`

### 6. Fechamento de Semana

- Disparado automaticamente ao registrar atividade em nova semana
- Calcula: XP total, bônus, agrupamento por categoria
- Cria snapshots de habilidades para a semana encerrada
- Persiste `WeekData` no banco e atualiza contadores globais

### 7. Sistema de Habilidades (Skill Expertise)

- **6 níveis de expertise** (em português):

| Nível | Semanas mínimas | Taxa mínima |
|---|---|---|
| Iniciante | 0 | 0% |
| Praticante | 4 | 50% |
| Competente | 8 | 65% |
| Especialista | 12 | 80% |
| Expert | 52 | 90% |
| Mestre | 104 | 95% |

- Progresso calculado por **semanas consecutivas** + **taxa de conclusão média**
- Snapshots semanais armazenados em `user_skill_snapshots`
- Exibição de semanas restantes para o próximo nível

### 8. Conquistas (Achievements)

- **9 conquistas** configuradas no banco
- Avaliadas a cada atividade registrada
- Toast animado ao desbloquear (auto-dismiss 3.5s)

| Tipo de condição | Descrição |
|---|---|
| `threshold` | Ex.: completar X atividades no total |
| `streak` | Ex.: streak de 7 dias |
| `level` | Ex.: atingir nível 5 |
| `category_count` | Ex.: usar 5 categorias diferentes |
| `weekly_threshold` | Ex.: 200+ XP em uma semana |

### 9. Histórico

- Atividades agrupadas por data (relativo: "Hoje", "Ontem", N dias atrás)
- Exibe total de XP por dia e detalhes de cada entrada
- Componente `HistoryTab`

### 10. Semanas

- Histórico completo de semanas encerradas (S01, S02, ...)
- Dados: datas início/fim, XP ganho, bônus, breakdown por categoria
- Componente `WeeksTab`

### 11. Perfil de Usuário

- Nome, cargo (job title), posição atual, bio
- Upload de avatar com **corte/zoom no cliente** (Canvas API), armazenado no Supabase Storage
- Rastreamento de progressão de carreira:
  - `previousPosition` — posição anterior
  - `lastPromotionDate` — data da última mudança
- Estatísticas do perfil: XP, atividades, streak, semanas, missões
- Melhor habilidade em destaque

### 12. Autenticação (Supabase Auth)

- Login e cadastro via email + senha
- Metadados no auth: name, jobTitle, currentPosition
- `AuthProvider`: contexto global, redireciona para `/login` se não autenticado
- `onAuthStateChange` para sessão reativa

### 13. PWA (Progressive Web App)

- Service Worker registrado via `PwaRegister.tsx`
- Manifest configurado no layout (tema, ícones, display standalone)
- Funciona offline após primeiro carregamento

## Banco de Dados (Supabase / PostgreSQL)

### Tabelas de Configuração (Públicas)

| Tabela | Conteúdo |
|---|---|
| `config_ranks` | 15 ranks com XP requerido e tier |
| `config_categories` | 7 categorias com XP, ícone e metadata |
| `config_achievements` | 9 conquistas com condições |
| `config_tier_colors` | 5 esquemas de cores por tier |
| `config_weekly_bonuses` | 3 thresholds de bônus semanal |

### Tabelas de Usuário (Protegidas por RLS)

| Tabela | Conteúdo |
|---|---|
| `user_state` | Estado escalar: XP, streak, total_tasks, unlocked_achievements, etc. |
| `user_profiles` | Perfil: name, job_title, position, picture_url, bio, promotion data |
| `user_activities` | Log completo de atividades |
| `user_missions` | Missões semanais |
| `user_mission_completions` | Registro de missões completadas |
| `user_weekly_data` | Resumos de semanas encerradas |
| `user_skill_snapshots` | Snapshots semanais de habilidades por categoria |

**Trigger automático:** `handle_new_user()` — cria `user_state` e `user_profiles` no cadastro via Supabase Auth.

### Migrations

| Arquivo | Conteúdo |
|---|---|
| `001_config_tables.sql` | Tabelas de config + seed data completo |
| `002_user_tables.sql` | Tabelas de usuário + RLS + trigger |
| `003_user_profile_promotion.sql` | Coluna `previous_position` |
| `004_user_profile_promotion_date.sql` | Coluna `last_promotion_at` |

---

## Estado Global (Zustand)

6 slices compostos em um único `useStore`:

| Slice | Responsabilidade |
|---|---|
| `dataSlice` | Carrega config da API e dados do usuário via Supabase; singleton com cache |
| `activitySlice` | Adicionar atividades, fechar semana, avaliar conquistas, calcular streak |
| `missionsSlice` | CRUD de missões, completar missão, stats semanais |
| `skillsSlice` | Calcular expertise por habilidade, computar snapshots semanais |
| `profileSlice` | Atualizar perfil, detectar e registrar promoção de posição |
| `uiSlice` | Controle do toast de conquistas |

**Padrão de sync:** fire-and-forget (não bloqueia UI; erros logados no console)

## Variáveis de Ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Fluxos Principais

### Registrar Atividade
1. Usuário seleciona categoria e nota opcional
2. Valida se categoria existe no cache
3. Detecta mudança de semana → fecha semana atual se necessário
4. Calcula novo streak
5. Cria `ActivityEntry` com ID gerado, XP e timestamp
6. Atualiza contadores (categoryCount, totalXP, totalTasks)
7. Avalia todas as conquistas contra `AchievementStats`
8. Exibe toast de conquista se desbloqueada (auto-dismiss 3.5s)
9. Persiste no Supabase em background

### Fechar Semana
1. Coleta atividades da semana atual
2. Calcula XP total + bônus por threshold
3. Agrupa por categoria
4. Cria `WeekData`
5. Computa snapshots de habilidades
6. Adiciona bônus ao XP total
7. Sincroniza tudo com o Supabase

### Completar Missão
1. Busca missão por ID
2. Verifica se já foi completada esta semana
3. Chama `addActivity()` com categoria e nota da missão
4. Cria `MissionCompletion` linkada ao `ActivityEntry`
5. Remove missão se não for fixa

### Calcular Expertise
1. Recupera todos os snapshots da habilidade
2. Conta semanas consecutivas cumprindo taxa mínima do nível atual
3. Calcula taxa média de conclusão geral
4. Determina nível atual e próximo
5. Calcula semanas e taxa necessárias para subir

---

*Gerado em 20/02/2026*


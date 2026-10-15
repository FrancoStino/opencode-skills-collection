# Taxonomia de Capacidades (Capability Tags)

Categorias padrao para classificar skills no ecossistema.
Cada skill pode ter multiplas categorias.

---

## Categorias

### data-extraction
**Descricao:** Coleta e extracao de dados de fontes web ou APIs.
**Keywords PT:** raspar, extrair, coletar, dados, tabela
**Keywords EN:** scrape, extract, crawl, parse, harvest, collect, data, table, csv
**Exemplos do ecossistema original:** web-scraper, junta-leiloeiros

### messaging
**Descricao:** Envio e recebimento de mensagens via plataformas de comunicacao.
**Keywords PT:** mensagem, enviar, notificacao, atendimento, comunicar, avisar
**Keywords EN:** whatsapp, message, send, chat, notify, notification, sms
**Exemplos do ecossistema original:** whatsapp-cloud-api

### social-media
**Descricao:** Interacao com plataformas de redes sociais (posts, stories, analytics).
**Keywords PT:** publicar, rede social, engajamento, post, stories
**Keywords EN:** instagram, facebook, twitter, post, stories, reels, social, feed, follower
**Exemplos do ecossistema original:** instagram

### government-data
**Descricao:** Coleta de dados governamentais, registros publicos, orgaos oficiais.
**Keywords PT:** junta, leiloeiro, cadastro, governo, comercial, tribunal, certidao, registro
**Keywords EN:** government, registry, official, court, public records
**Exemplos do ecossistema original:** junta-leiloeiros

### web-automation
**Descricao:** Automacao de navegador, preenchimento de formularios, interacao com paginas.
**Keywords PT:** navegador, automatizar, automacao, preencher
**Keywords EN:** browser, selenium, playwright, automate, click, fill form
**Exemplos do ecossistema original:** web-scraper

### api-integration
**Descricao:** Integracao com APIs externas, webhooks, autenticacao OAuth.
**Keywords PT:** integracao, integrar, conectar, api, webhook
**Keywords EN:** api, endpoint, webhook, rest, graph, oauth, token
**Exemplos do ecossistema original:** whatsapp-cloud-api, instagram

### analytics
**Descricao:** Analise de dados, metricas, dashboards, relatorios.
**Keywords PT:** relatorio, metricas, analise, estatistica
**Keywords EN:** insight, analytics, metrics, dashboard, report, stats
**Exemplos do ecossistema original:** (nenhuma dedicada ainda)

### content-management
**Descricao:** Publicacao, agendamento e gestao de conteudo em plataformas.
**Keywords PT:** publicar, agendar, conteudo, midia, template
**Keywords EN:** publish, schedule, template, content, media, upload
**Exemplos do ecossistema original:** instagram

---

## Roles (Papeis)

As categorias se agrupam em papeis para orquestracao:

| Papel      | Categorias                                      | Descricao                        |
|:-----------|:------------------------------------------------|:---------------------------------|
| Producer   | data-extraction, government-data, analytics     | Gera/coleta dados                |
| Consumer   | messaging, social-media, content-management     | Atua sobre dados (envia, publica)|
| Hybrid     | api-integration, web-automation                 | Pode produzir e consumir dados   |

---

## Como Declarar no SKILL.md

Adicionar campo `capabilities` ao frontmatter YAML:

```yaml
---
name: minha-skill
description: "..."
capabilities: [data-extraction, web-automation]
---
```

Se omitido, o scanner extrai automaticamente da `description` via keywords.
O scanner une tags explicitas e inferidas e remove duplicatas; nao implementa prioridade entre elas. Keywords sao heuristicas, nao certificacao de capacidade ou seguranca.

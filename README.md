# Imobiliária Cosentino — Criativos ativos

Portal público para consulta dos criativos atualmente utilizados nas campanhas da Imobiliária Cosentino, separados por estratégia de aquisição, venda e aluguel.

As imagens e os vídeos da Meta são hospedados neste repositório. Os vídeos do Google são incorporados pelo YouTube, sem baixar MP4s.

## Meta Ads

- Período: início do mês até a data da atualização, incluindo o dia parcial.
- Somente campanhas com status efetivo `ACTIVE` no momento da consulta entram nas métricas. O investimento inclui todo o período dessas campanhas.
- Leads: conversas por mensagem iniciadas, ação `onsite_conversion.messaging_conversation_started_7d` da Meta. Formulários e `LeadCompleto` não são somados.
- CPL por estratégia: investimento da estratégia dividido pelas conversas. CPL geral: investimento de todas as campanhas ativas dividido por todas as conversas dessas campanhas.
- Criativos: somente anúncios ativos de campanhas ativas.

## Google Ads

Aba independente, com o mesmo padrão visual da Meta, filtros por campanha e tipo de recurso, busca e detalhes.

- Métricas: todas as campanhas da conta, início do mês até a atualização (dia parcial).
- Leads = `Lead_Site_Form` + `LeadCompleto`. MQL = `LeadCompleto`, já incluído nos leads. CPL = investimento / leads.
- Investimento, leads, CPL, MQLs, impressões, cliques, CTR e CPC.
- Galeria de imagens e vídeos do YouTube vinculados às campanhas ativas; títulos e descrições somente nas combinações. Vínculo não garante veiculação no período.
- Pesquisa: até cinco combinações por anúncio, ordenadas por impressões no período.
- Performance Max: combinações fora do ranking, pois o relatório não fornece impressões e cliques por combinação.
- As prévias representam os recursos da combinação; não são capturas exatas da aparência do anúncio.
- Datas de atualização independentes por plataforma. Nenhuma credencial é publicada.

## Refinamento da galeria em 24/09

Logos removidas, incluindo variações cadastradas como imagens comuns. Textos aparecem somente nas combinações, sem cartões isolados. O ranking mostra combinações de Pesquisa com impressões positivas, ordenadas por impressões; cliques por combinação não são suportados pela API. Performance Max fica fora desse ranking por não fornecer essas métricas.

## Nomes e duplicatas

A galeria agrupa recursos ativos pelo nome normalizado (tipo, nome sem acentos, espaços normalizados e palavra Vídeo opcional). Formatos e dimensões no nome são preservados; todos os vínculos de campanha/grupo são reunidos. Recursos sem nome real não são agrupados pelo rótulo genérico. Os nomes ficam ocultos nos cartões e detalhes; recursos automáticos com nome original fornecido pela API preservam o nome. Na extração atual, as imagens automáticas do site vieram sem nome original.

## Métricas por anúncio Meta

Cartões e detalhes mostram impressões, alcance, cliques (todos), investimento, resultados, CPM, CTR (todos) e CPA no mês. Resultado WhatsApp: conversas iniciadas (`onsite_conversion.messaging_conversation_started_7d`); engajamento: `post_engagement`. CPA = gasto / resultado, CTR = cliques / impressões, CPM = gasto × 1000 / impressões. Denominador zero: travessão. Alcance consultado no período completo, sem somar dias. O resumo de leads continua com sua definição própria.

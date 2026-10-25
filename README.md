# Roteiro Europa Central 2027

Site do roteiro **Cracóvia → Varsóvia → Praga → Budapeste → Bratislava → Viena** (29/03 a 12/04/2027).

- **Hoje**: cartão com o programa do dia, trens, pontos e atalhos (112 e plantão da embaixada).
- **Mapa interativo** (Leaflet + OpenStreetMap): pontos numerados por cidade, filtros por cidade e por dia com o caminho do dia, bairros sugeridos para Airbnb, estações, rota de trem, embaixadas, lavanderias, satélite, transporte público e "minha localização".
- **Relógios** de cada país e de Brasília; **câmbio ao vivo** (BCE) com conversor e preços convertidos para € e R$.
- **Notas do Google** (aproximadas; com chave da Google Maps API em ⚙️ ficam ao vivo) e **fotos** da Wikipédia.
- **Emergência**: 112, polícia, ambulância, bombeiros e Embaixada do Brasil (endereço, telefone e plantão consular) de cada país.
- **Lavanderias** mais próximas da hospedagem (OpenStreetMap, ao vivo).
- **Editável**: botão ✏️ para alterar datas, cidades, lugares, trens, hospedagens e telefones. As edições ficam no navegador; use ⚙️ → Exportar/Importar para levar a outro aparelho.
- Feito para celular primeiro, com barra inferior e funcionamento offline (PWA — "Adicionar à tela inicial").

## Dados

Tudo o que aparece no site está em [`js/data.js`](js/data.js). A revisão do PDF/DOCX original está em [`js/review.js`](js/review.js) e aparece na seção "Revisão".

## Rodar localmente

```sh
python3 -m http.server 8000
# abra http://localhost:8000
```

## Publicar no Firebase Hosting

Manual: `npx firebase-tools login` e `npx firebase-tools deploy --only hosting --project SEU_PROJETO`.

Automático: configure o secret `FIREBASE_SERVICE_ACCOUNT` e a variável `FIREBASE_PROJECT_ID` no GitHub; cada push na `main` publica em `https://SEU_PROJETO.web.app`.

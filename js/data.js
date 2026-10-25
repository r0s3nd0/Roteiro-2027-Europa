// Dados padrão do roteiro. Tudo aqui pode ser alterado pelo site (modo edição),
// que salva as mudanças no navegador. Use "Exportar" para guardar um arquivo
// JSON e "Importar" para carregá-lo em outro aparelho.
//
// rating = nota do Google (aproximada, conferida em out/2026). Com uma chave
// da Google Maps API configurada em ⚙️, o site atualiza as notas ao vivo.
// price = valor principal em número, usado na conversão automática de moedas.

window.DEFAULT_DATA = {
  version: 4,
  trip: {
    title: "Europa Central 2027",
    subtitle: "15 dias · seis cidades · cinco países",
    start: "2027-03-29",
    end: "2027-04-12",
    arrival: "Cracóvia, 29/03 à noite",
    departure: "Viena, 12/04 — voo às 07:00",
    flightTime: "2027-04-12T07:00",
    homeTz: "America/Sao_Paulo",
    homeLabel: "Brasília"
  },

  cities: [
    {
      id: "krakow",
      wiki: "Kraków",
      name: "Cracóvia",
      country: "Polônia",
      cc: "PL",
      currency: "PLN",
      tz: "Europe/Warsaw",
      color: "#b45309",
      lat: 50.0617, lng: 19.9373,
      checkin: "2027-03-29",
      checkout: "2027-03-31",
      window: "A noite da chegada, o dia de Auschwitz e a manhã antes do trem. O centro histórico é compacto — quase tudo cabe a pé.",
      alert: {
        label: "Atenção",
        text: "29/03 é Segunda-feira de Páscoa (Drugi Dzień Wielkanocy / Śmigus-Dyngus), feriado nacional na Polônia. Museus, lojas e muitos restaurantes ficam fechados ou com horário reduzido — inclusive a Fábrica de Schindler. A noite de chegada deve ser de programa ao ar livre. O horário de verão europeu começa na madrugada de 28/03 (diferença para Brasília: +5h)."
      },
      tip: "Wawel, Grodzka e Kazimierz ficam no mesmo eixo sul: dá para fazer os três numa caminhada contínua de cerca de 25 minutos. A Fábrica de Schindler (ul. Lipowa 4) fica em Podgórze, do outro lado do rio, e consome cerca de 2h com deslocamento — só cabe se você abrir mão de Kazimierz.",
      stay: {
        hoods: "Stare Miasto (centro histórico) ou Grzegórzki, perto do centro e do transporte público.",
        tip: "Priorize o centro histórico para explorar a cidade a pé e facilitar a ida a Auschwitz.",
        areas: [
          { name: "Stare Miasto", lat: 50.0614, lng: 19.9366, radius: 650 },
          { name: "Grzegórzki", lat: 50.0590, lng: 19.9620, radius: 600 }
        ],
        booking: { name: "", address: "", link: "", lat: null, lng: null, notes: "" }
      },
      station: { name: "Kraków Główny", address: "Pawia 5a, 31-154 Kraków", note: "Colada ao shopping Galeria Krakowska, 8 min a pé do Rynek", lat: 50.0675, lng: 19.9474 },
      transit: "MPK: bonde e ônibus — bilhete de 20 min ≈ PLN 4 · 24h ≈ PLN 17",
      blocks: [
        {
          date: "2027-03-29", label: "Noite", sub: "A pé, 1h30",
          places: [
            { id: "kr1", icon: "🏛️", wiki: "Main Square, Kraków",  name: "Rynek Główny", desc: "A maior praça medieval da Europa, aberta e iluminada 24h.", address: "Rynek Główny, 31-042 Kraków", priceText: "Grátis", lat: 50.0617, lng: 19.9373, rating: 4.8 },
            { id: "kr2", icon: "🛍️", wiki: "Sukiennice",  name: "Sukiennice", desc: "A Lonja dos Tecidos; as arcadas do térreo ficam abertas à noite.", address: "Rynek Główny 1–3, Kraków", priceText: "Arcadas grátis · galeria no 1º andar ≈ PLN 40", price: { amount: 40, currency: "PLN" }, site: "https://mnk.pl", lat: 50.0616, lng: 19.9370, rating: 4.6 },
            { id: "kr3", icon: "⛪", wiki: "St. Mary's Basilica, Kraków",  name: "Basílica de Santa Maria", desc: "O toque do hejnał soa da torre a cada hora cheia.", address: "plac Mariacki 5, Kraków", priceText: "Nave ≈ PLN 20 · torre ≈ PLN 25", price: { amount: 20, currency: "PLN" }, site: "https://mariacki.com", lat: 50.0616, lng: 19.9394, rating: 4.8 },
            { id: "kr4", icon: "🏰", wiki: "Kraków Barbican",  name: "Barbacã e Porta de Floriana", desc: "5 min ao norte da praça, restos da muralha medieval.", address: "ul. Basztowa / ul. Floriańska, Kraków", priceText: "Ruas grátis · interior da Barbacã ≈ PLN 20", price: { amount: 20, currency: "PLN" }, site: "https://muzeumkrakowa.pl", lat: 50.0655, lng: 19.9418, rating: 4.6 }
          ]
        },
        {
          date: "2027-03-30", label: "Dia", sub: "Auschwitz",
          note: "Dia inteiro reservado para Auschwitz-Birkenau — ver a seção Auschwitz.",
          places: []
        },
        {
          date: "2027-03-31", label: "Manhã", sub: "Antes do trem",
          places: [
            { id: "kr5", icon: "🏰", wiki: "Wawel Castle",  name: "Colina e Castelo de Wawel", desc: "O pátio arcado e a colina são gratuitos e abrem antes das exposições.", address: "Wawel 5, 31-001 Kraków", priceText: "Colina e pátio grátis · Castelo 1º+2º andar PLN 95 · andar isolado PLN 57 · Tesouro, Armaria ou Subterrâneos PLN 47 cada", price: { amount: 95, currency: "PLN" }, site: "https://bilety.wawel.krakow.pl", lat: 50.0540, lng: 19.9354, rating: 4.7 },
            { id: "kr6", icon: "⛪", wiki: "Wawel Cathedral",  name: "Catedral de Wawel", desc: "Ingresso separado do castelo, comprado na loja em frente.", address: "Wawel 3, 31-001 Kraków", priceText: "≈ PLN 25 (inclui torre do sino e criptas)", price: { amount: 25, currency: "PLN" }, site: "https://katedra-wawelska.pl", lat: 50.0545, lng: 19.9351, rating: 4.8 },
            { id: "kr7", icon: "🚶", wiki: "Grodzka Street",  name: "Rua Grodzka", desc: "Liga Wawel de volta ao Rynek em 10 minutos, sem repetir caminho.", address: "ul. Grodzka, Kraków", priceText: "Grátis", lat: 50.0580, lng: 19.9375, rating: 4.7 },
            { id: "kr8", icon: "🕍", wiki: "Kazimierz",  name: "Kazimierz", desc: "Se sobrar tempo: rua Szeroka, Praça Nowy e as sinagogas do antigo bairro judeu.", address: "ul. Szeroka, 31-053 Kraków", priceText: "Ruas grátis · Sinagoga Velha ≈ PLN 20", price: { amount: 20, currency: "PLN" }, site: "https://muzeumkrakowa.pl", lat: 50.0521, lng: 19.9480, rating: 4.6 },
            { id: "kr9", icon: "🏭", wiki: "Oskar Schindler's Enamel Factory",  name: "Fábrica de Schindler (opcional)", desc: "Em Podgórze; entrada com horário marcado. Troca por Kazimierz.", address: "ul. Lipowa 4, 30-702 Kraków", priceText: "PLN 60 regular / PLN 45 reduzido", price: { amount: 60, currency: "PLN" }, site: "https://muzeumkrakowa.pl", lat: 50.0475, lng: 19.9614, rating: 4.6 }
          ]
        }
      ]
    },
    {
      id: "warsaw",
      wiki: "Warsaw",
      name: "Varsóvia",
      country: "Polônia",
      cc: "PL",
      currency: "PLN",
      tz: "Europe/Warsaw",
      color: "#be123c",
      lat: 52.2297, lng: 21.0122,
      checkin: "2027-03-31",
      checkout: "2027-04-02",
      window: "Um dia cheio, quinta-feira. Varsóvia é mais espalhada que Cracóvia — conte com metrô ou bonde entre os blocos.",
      alert: {
        label: "Economia",
        text: "Quinta-feira é dia de entrada gratuita no POLIN e no Museu do Levante de Varsóvia. Como 01/04 é exatamente uma quinta, os dois museus mais caros do dia saem de graça — vale chegar na abertura, porque é também o dia mais movimentado. Ambos fecham às terças."
      },
      tip: "A Cidade Velha e o POLIN estão a cerca de 15 minutos a pé um do outro, pelo bairro de Muranów. O Palácio da Cultura fica colado na Warszawa Centralna — deixe-o para o fim do dia 01/04 ou para a manhã de 02/04, com as malas no guarda-volumes da estação.",
      stay: {
        hoods: "Śródmieście, de preferência perto das estações Centrum ou Świętokrzyska.",
        tip: "Uma localização central ajuda a conhecer a cidade e reduz a dependência de táxi ou aplicativos.",
        areas: [
          { name: "Śródmieście (Centrum / Świętokrzyska)", lat: 52.2330, lng: 21.0095, radius: 700 }
        ],
        booking: { name: "", address: "", link: "", lat: null, lng: null, notes: "" }
      },
      station: { name: "Warszawa Centralna", address: "al. Jerozolimskie 54, 00-024 Warszawa", note: "Ao lado do Palácio da Cultura", lat: 52.2289, lng: 21.0032 },
      transit: "ZTM: metrô, bonde e ônibus — 20 min ≈ PLN 3,40 · 24h ≈ PLN 15",
      blocks: [
        {
          date: "2027-04-01", label: "Manhã", sub: "Cidade Velha",
          places: [
            { id: "wa1", icon: "🏘️", wiki: "Warsaw Old Town",  name: "Stare Miasto", desc: "A Cidade Velha reconstruída após 1944, Patrimônio Mundial da UNESCO.", address: "Rynek Starego Miasta, 00-272 Warszawa", priceText: "Grátis", lat: 52.2497, lng: 21.0122, rating: 4.8 },
            { id: "wa2", icon: "🏰", wiki: "Royal Castle, Warsaw",  name: "Castelo Real", desc: "Na entrada sul da Cidade Velha, ao lado da Coluna de Sigismundo.", address: "plac Zamkowy 4, 00-277 Warszawa", priceText: "≈ PLN 50 na rota principal", price: { amount: 50, currency: "PLN" }, site: "https://zamek-krolewski.pl", lat: 52.2479, lng: 21.0144, rating: 4.7 },
            { id: "wa3", icon: "🧱", wiki: "Warsaw Barbican",  name: "Barbacã e muralhas", desc: "O trecho reconstruído ao norte da praça.", address: "ul. Nowomiejska, 00-001 Warszawa", priceText: "Grátis", lat: 52.2514, lng: 21.0098, rating: 4.6 }
          ]
        },
        {
          date: "2027-04-01", label: "Tarde", sub: "Memória",
          places: [
            { id: "wa4", icon: "🏛️", wiki: "POLIN Museum of the History of Polish Jews",  name: "POLIN — Museu da História dos Judeus Poloneses", desc: "Cerca de 2h30; fecha às terças, e às quintas a entrada é gratuita.", address: "ul. Mordechaja Anielewicza 6, 00-157 Warszawa", priceText: "Grátis às quintas · demais dias PLN 45 (reduzido PLN 35)", price: { amount: 0, currency: "PLN" }, site: "https://polin.pl", lat: 52.2494, lng: 20.9931, rating: 4.7 },
            { id: "wa5", icon: "🕯️", wiki: "Monument to the Ghetto Heroes",  name: "Monumento aos Heróis do Gueto", desc: "Em frente ao POLIN, no mesmo largo.", address: "ul. Zamenhofa, 00-165 Warszawa", priceText: "Grátis", lat: 52.2496, lng: 20.9944, rating: 4.7 },
            { id: "wa6", icon: "🏛️", wiki: "Warsaw Uprising Museum",  name: "Museu do Levante de Varsóvia", desc: "Alternativa ao POLIN; o filme 3D “Cidade em Ruínas” está incluído.", address: "ul. Grzybowska 79, 00-844 Warszawa", priceText: "Grátis às quintas · audioguia PLN 10 · metrô M2 Rondo Daszyńskiego, 10 min a pé", price: { amount: 0, currency: "PLN" }, site: "https://www.1944.pl", lat: 52.2323, lng: 20.9810, rating: 4.7 }
          ]
        },
        {
          date: "2027-04-01", label: "Fim do dia", sub: "Vista e eixo real",
          places: [
            { id: "wa7", icon: "🚶", wiki: "Krakowskie Przedmieście",  name: "Trakt Królewski", desc: "A Rota Real: Krakowskie Przedmieście e Nowy Świat, tudo a pé.", address: "Krakowskie Przedmieście, 00-001 Warszawa", priceText: "Grátis", lat: 52.2420, lng: 21.0150, rating: 4.8 },
            { id: "wa8", icon: "🌆", wiki: "Palace of Culture and Science",  name: "Palácio da Cultura e Ciência", desc: "Mirante no 30º andar, colado na estação Centralna.", address: "plac Defilad 1, 00-901 Warszawa", priceText: "≈ PLN 30", price: { amount: 30, currency: "PLN" }, site: "https://pkin.pl", lat: 52.2318, lng: 21.0060, rating: 4.6 }
          ]
        }
      ]
    },
    {
      id: "prague",
      wiki: "Prague",
      name: "Praga",
      country: "Chéquia",
      cc: "CZ",
      currency: "CZK",
      tz: "Europe/Prague",
      color: "#1d4ed8",
      lat: 50.0755, lng: 14.4378,
      checkin: "2027-04-02",
      checkout: "2027-04-05",
      window: "Dois dias cheios, sábado e domingo. O rio Vltava divide naturalmente o roteiro — um dia por margem.",
      alert: {
        label: "Atenção",
        text: "O Museu Judaico de Praga fecha aos sábados e em feriados judaicos, abrindo nos outros dias das 9h às 18h no horário de verão. Por isso Josefov precisa ficar no domingo 04/04, e não no sábado."
      },
      tip: "Fazer o Castelo às 9h e a Ponte Carlos ao anoitecer resolve os dois maiores gargalos de multidão no mesmo dia. Josefov, Praça da Cidade Velha e Praça Venceslau formam uma linha quase reta de 1,5 km — o domingo inteiro cabe sem transporte. Prague Visitor Pass de 72h (≈ €90) só compensa a partir de seis ou sete atrações pagas.",
      stay: {
        hoods: "Nové Město, perto de Můstek ou Muzeum; alternativa: Vinohrady, perto de Náměstí Míru.",
        tip: "Nové Město combina localização central, metrô e acesso às atrações históricas.",
        areas: [
          { name: "Nové Město (Můstek / Muzeum)", lat: 50.0815, lng: 14.4265, radius: 650 },
          { name: "Vinohrady (Náměstí Míru)", lat: 50.0753, lng: 14.4378, radius: 550 }
        ],
        booking: { name: "", address: "", link: "", lat: null, lng: null, notes: "" }
      },
      station: { name: "Praha hlavní nádraží", address: "Wilsonova 8, 110 00 Praha 2", note: "Metrô C, 10 min a pé da Praça Venceslau", lat: 50.0833, lng: 14.4353 },
      transit: "DPP: 30 min 30 CZK · 24h 120 CZK · 72h ≈ 330 CZK",
      blocks: [
        {
          date: "2027-04-03", label: "Sábado", sub: "Margem esquerda",
          places: [
            { id: "pr1", icon: "🏰", wiki: "Prague Castle",  name: "Castelo de Praga", desc: "Chegue na abertura, às 9h; o Circuito B cobre a Catedral de São Vito, o Palácio Real Velho, a Basílica de São Jorge e o Beco Dourado.", address: "Hradčany, 119 08 Praha 1", priceText: "Pátios grátis · Circuito B 250–350 CZK conforme a fonte", price: { amount: 350, currency: "CZK" }, site: "https://www.hrad.cz", lat: 50.0909, lng: 14.4005, rating: 4.7 },
            { id: "pr2", icon: "⛪", wiki: "St. Nicholas Church (Malá Strana)",  name: "Igreja de São Nicolau (Malá Strana)", desc: "O interior barroco mais completo da cidade, na descida do castelo.", address: "Malostranské náměstí 25, 118 00 Praha 1", priceText: "≈ CZK 150", price: { amount: 150, currency: "CZK" }, site: "https://www.stnicholas.cz", lat: 50.0880, lng: 14.4034, rating: 4.8 },
            { id: "pr3", icon: "🎨", wiki: "Lennon Wall",  name: "Ilha Kampa e Muro de John Lennon", desc: "10 min ao sul, à beira d’água.", address: "Velkopřevorské náměstí, 118 00 Praha 1", priceText: "Grátis", lat: 50.0862, lng: 14.4067, rating: 4.4 },
            { id: "pr4", icon: "🗼", wiki: "Petřín Lookout Tower",  name: "Petřín", desc: "Opcional: funicular até a torre mirante e o labirinto de espelhos.", address: "Petřínské sady, 118 00 Praha 1", priceText: "Torre + labirinto 220 CZK · funicular usa o bilhete comum de transporte", price: { amount: 220, currency: "CZK" }, site: "https://www.muzeumprahy.cz", lat: 50.0835, lng: 14.3951, rating: 4.6 },
            { id: "pr5", icon: "🌉", wiki: "Charles Bridge",  name: "Ponte Carlos", desc: "Atravesse no fim da tarde, com luz baixa e menos gente.", address: "Karlův most, 110 00 Praha 1", priceText: "Grátis", lat: 50.0865, lng: 14.4114, rating: 4.8 }
          ]
        },
        {
          date: "2027-04-04", label: "Domingo", sub: "Margem direita",
          places: [
            { id: "pr6", icon: "🕍", wiki: "Jewish Museum in Prague",  name: "Josefov — Museu Judaico", desc: "Sinagoga Pinkas, Cemitério Judaico Velho, Sinagoga Maisel e Sinagoga Espanhola; comece às 9h, as filas crescem depois.", address: "U Staré školy 141/1, 110 00 Praha 1", priceText: "Combinado 5 locais 550 CZK · com a Sinagoga Velha-Nova 750 CZK · reserve 2 a 3h", price: { amount: 550, currency: "CZK" }, site: "https://www.jewishmuseum.cz", lat: 50.0897, lng: 14.4180, rating: 4.5 },
            { id: "pr7", icon: "🕰️", wiki: "Prague astronomical clock",  name: "Praça da Cidade Velha e Relógio Astronômico", desc: "A procissão dos apóstolos acontece a cada hora cheia, de graça, na rua.", address: "Staroměstské náměstí, 110 00 Praha 1", priceText: "Grátis para assistir", lat: 50.0870, lng: 14.4206, rating: 4.7 },
            { id: "pr8", icon: "🗼", wiki: "Old Town Hall (Prague)",  name: "Torre da Câmara Municipal Velha", desc: "A melhor vista do conjunto de telhados; tem elevador.", address: "Staroměstské náměstí 1, 110 00 Praha 1", priceText: "250 CZK · com audioguia 350 CZK", price: { amount: 250, currency: "CZK" }, site: "https://www.prague.eu", lat: 50.0873, lng: 14.4199, rating: 4.7 },
            { id: "pr9", icon: "🏙️", wiki: "Wenceslas Square",  name: "Praça Venceslau", desc: "8 min ao sul, pela Na Příkopě.", address: "Václavské náměstí, 110 00 Praha 1", priceText: "Grátis", lat: 50.0813, lng: 14.4280, rating: 4.5 },
            { id: "pr10", icon: "🏢", wiki: "Dancing House",  name: "Casa Dançante e Náplavka", desc: "Margem do rio, bom para o fim de tarde.", address: "Jiráskovo náměstí 1981/6, 120 00 Praha 2", priceText: "Exterior grátis · terraço do bar ≈ CZK 200", price: { amount: 200, currency: "CZK" }, lat: 50.0755, lng: 14.4140, rating: 4.4 }
          ]
        }
      ]
    },
    {
      id: "budapest",
      wiki: "Budapest",
      name: "Budapeste",
      country: "Hungria",
      cc: "HU",
      currency: "HUF",
      tz: "Europe/Budapest",
      color: "#047857",
      lat: 47.4979, lng: 19.0402,
      checkin: "2027-04-05",
      checkout: "2027-04-08",
      window: "Dois dias cheios, terça e quarta. O Danúbio separa Pest (plana, monumental) de Buda (colina, castelo) — um dia para cada lado.",
      alert: {
        label: "Reservar antes",
        text: "O Parlamento húngaro só pode ser visitado em visita guiada de 45 minutos e os ingressos esgotam de 1 a 3 semanas antes. Entre abril e outubro abre das 8h às 18h. É também o ingresso mais caro da viagem para quem não é da União Europeia."
      },
      tip: "Parlamento, Sapatos e Basílica formam um triângulo de 25 minutos a pé — cabem numa única manhã. Do lado de Buda, Bastião, Igreja Matias e Castelo estão todos no mesmo platô: suba uma vez só, de funicular a partir da Ponte das Correntes ou pelo ônibus 16, e desça a pé pela Colina Gellért.",
      stay: {
        hoods: "Distrito V, perto de Deák Ferenc tér; alternativa: Distrito VII, perto de Astoria.",
        tip: "Deák Ferenc tér conecta três linhas de metrô e facilita bastante os deslocamentos turísticos.",
        areas: [
          { name: "Distrito V (Deák Ferenc tér)", lat: 47.4977, lng: 19.0530, radius: 600 },
          { name: "Distrito VII (Astoria)", lat: 47.4950, lng: 19.0620, radius: 550 }
        ],
        booking: { name: "", address: "", link: "", lat: null, lng: null, notes: "" }
      },
      station: { name: "Budapest-Nyugati", address: "Teréz krt. 55, 1062 Budapest", note: "Chegada dos EuroCity de Praga e saída para Bratislava (confira no bilhete — alguns trens usam Keleti; RegioJet pode usar outra estação)", lat: 47.5105, lng: 19.0566 },
      transit: "BKK: bilhete simples ≈ HUF 450 · 24h ≈ HUF 2.500",
      blocks: [
        {
          date: "2027-04-06", label: "Terça", sub: "Lado Pest",
          places: [
            { id: "bu1", icon: "🏛️", wiki: "Hungarian Parliament Building",  name: "Parlamento", desc: "Visita guiada com horário marcado; comece o dia por aqui.", address: "Kossuth Lajos tér 1–3, 1055 Budapest", priceText: "Não-UE HUF 23.150 · UE HUF 14.270", price: { amount: 23150, currency: "HUF" }, site: "https://www.parlament.hu", lat: 47.5071, lng: 19.0456, rating: 4.8 },
            { id: "bu2", icon: "🕯️", wiki: "Shoes on the Danube Bank",  name: "Sapatos à Beira do Danúbio", desc: "Memorial a 5 min a pé do Parlamento, sempre aberto.", address: "Id. Antall József rkp., 1054 Budapest", priceText: "Grátis", lat: 47.5045, lng: 19.0450, rating: 4.7 },
            { id: "bu3", icon: "⛪", wiki: "St. Stephen's Basilica",  name: "Basílica de Santo Estêvão", desc: "O mirante do zimbório cobre toda a Pest; 364 degraus ou elevador.", address: "Szent István tér 1, 1051 Budapest", priceText: "Igreja ≈ HUF 4.400 · combinado com tesouro e terraço ≈ €21", price: { amount: 4400, currency: "HUF" }, site: "https://www.bazilika.biz", lat: 47.5009, lng: 19.0539, rating: 4.8 },
            { id: "bu4", icon: "🏛️", wiki: "House of Terror",  name: "Avenida Andrássy, Casa do Terror e Praça dos Heróis", desc: "Caminhada de 2,5 km; a Casa do Terror (Andrássy út 60) fica no caminho e fecha às segundas.", address: "Andrássy út 60, 1062 Budapest", priceText: "Avenida grátis · Casa do Terror ≈ HUF 4.000", price: { amount: 4000, currency: "HUF" }, site: "https://www.terrorhaza.hu", lat: 47.5068, lng: 19.0651, rating: 4.5 },
            { id: "bu5", icon: "♨️", wiki: "Széchenyi thermal bath",  name: "Banho Termal Széchenyi", desc: "No Parque da Cidade, ao fim da avenida; entrada antes das 9h é a mais barata.", address: "Állatkerti krt. 9–11, 1146 Budapest", priceText: "Cabine privativa HUF 14.200 dias úteis / HUF 15.800 fins de semana · “Good Morning” antes das 9h a partir de HUF 10.500", price: { amount: 14200, currency: "HUF" }, site: "https://www.szechenyifurdo.hu", lat: 47.5189, lng: 19.0821, rating: 4.4 }
          ]
        },
        {
          date: "2027-04-07", label: "Quarta", sub: "Lado Buda",
          places: [
            { id: "bu6", icon: "🏰", wiki: "Fisherman's Bastion",  name: "Bastião dos Pescadores", desc: "Vá ao amanhecer: sem fila, sem taxa nos terraços superiores e com a melhor luz sobre o Parlamento.", address: "Szentháromság tér, 1014 Budapest", priceText: "Terraços inferiores grátis · terraço superior ≈ HUF 1.500 em horário comercial", price: { amount: 1500, currency: "HUF" }, site: "https://www.fishermansbastion.com", lat: 47.5021, lng: 19.0347, rating: 4.8 },
            { id: "bu7", icon: "⛪", wiki: "Matthias Church",  name: "Igreja Matias", desc: "No mesmo platô, a 1 minuto do Bastião.", address: "Szentháromság tér 2, 1014 Budapest", priceText: "≈ HUF 3.000", price: { amount: 3000, currency: "HUF" }, site: "https://www.matyas-templom.hu", lat: 47.5019, lng: 19.0342, rating: 4.8 },
            { id: "bu8", icon: "🏰", wiki: "Buda Castle",  name: "Castelo de Buda — Sala de Santo Estêvão", desc: "O ingresso vale também para as exposições do Museu de História de Budapeste.", address: "Szent György tér 2, 1014 Budapest", priceText: "HUF 4.900 · combinado com o Museu de História HUF 5.900", price: { amount: 4900, currency: "HUF" }, site: "https://www.szentistvanterem.hu", lat: 47.4962, lng: 19.0396, rating: 4.7 },
            { id: "bu9", icon: "⛰️", wiki: "Gellért Hill",  name: "Colina Gellért e Cidadela", desc: "A vista mais ampla da cidade; subida de cerca de 30 min.", address: "Citadella sétány, 1118 Budapest", priceText: "Grátis", lat: 47.4870, lng: 19.0466, rating: 4.7 },
            { id: "bu10", icon: "🚡", wiki: "Budapest Castle Hill Funicular",  name: "Funicular Budavári Sikló", desc: "Opcional para subir ao castelo, 90 segundos sobre o Danúbio.", address: "Clark Ádám tér, 1013 Budapest", priceText: "Ida e volta HUF 5.000 · não incluído no Budapest Card", price: { amount: 5000, currency: "HUF" }, site: "https://bkv.hu", lat: 47.4977, lng: 19.0390, rating: 4.5 },
            { id: "bu11", icon: "🛒", wiki: "Great Market Hall (Budapest)",  name: "Grande Mercado Central", desc: "Fecha aos domingos; quarta é dia bom e o andar de cima tem comida pronta.", address: "Vámház krt. 1–3, 1093 Budapest", priceText: "Grátis", lat: 47.4870, lng: 19.0585, rating: 4.4 },
            { id: "bu12", icon: "🍺", wiki: "Szimpla Kert",  name: "Bairro judeu e ruin bars", desc: "Szimpla Kert e arredores, à noite.", address: "Kazinczy u. 14, 1075 Budapest", priceText: "Entrada grátis · cerveja ≈ HUF 1.500", price: { amount: 1500, currency: "HUF" }, site: "https://szimpla.hu", lat: 47.4970, lng: 19.0633, rating: 4.6 }
          ]
        }
      ]
    },
    {
      id: "bratislava",
      wiki: "Bratislava",
      name: "Bratislava",
      country: "Eslováquia",
      cc: "SK",
      currency: "EUR",
      tz: "Europe/Bratislava",
      color: "#7c3aed",
      lat: 48.1486, lng: 17.1077,
      checkin: "2027-04-08",
      checkout: "2027-04-09",
      window: "Uma tarde e uma manhã. É o menor centro histórico da viagem e isso é uma vantagem — tudo está num raio de 1,5 km, e quase tudo é gratuito por fora.",
      alert: null,
      tip: "Faça o check-in ou deixe as malas antes de começar — a Bratislava hlavná stanica fica fora do centro, cerca de 15 min de bonde. Deixe a manhã de 09/04 livre para um café na praça e a caminhada de volta; o trem para Viena é curto e frequente.",
      stay: {
        hoods: "Staré Mesto, perto do centro histórico e de paradas de bonde.",
        tip: "Bratislava não tem metrô. Para uma única noite, priorize o centro e o acesso à estação ferroviária.",
        areas: [
          { name: "Staré Mesto", lat: 48.1440, lng: 17.1080, radius: 550 }
        ],
        booking: { name: "", address: "", link: "", lat: null, lng: null, notes: "" }
      },
      station: { name: "Bratislava hlavná stanica", address: "Námestie Franza Liszta 1, 811 04 Bratislava", note: "Fora do centro: 15 min de bonde até a cidade velha", lat: 48.1585, lng: 17.1066 },
      transit: "DPB: 30 min ≈ €1,10 · 24h ≈ €4,20",
      blocks: [
        {
          date: "2027-04-08", label: "Tarde", sub: "Cidade Velha",
          places: [
            { id: "br1", icon: "🏰", wiki: "Michael's Gate",  name: "Portão de São Miguel", desc: "Único portão medieval remanescente; o mirante no alto é pequeno e rápido.", address: "Michalská 22, 811 01 Bratislava", priceText: "Rua grátis · torre ≈ €7", price: { amount: 7, currency: "EUR" }, site: "https://www.muzeum.bratislava.sk", lat: 48.1449, lng: 17.1065, rating: 4.6 },
            { id: "br2", icon: "🏛️", wiki: "Old Town Hall (Bratislava)",  name: "Hlavné námestie e Velha Prefeitura", desc: "A praça principal, com a Fonte de Roland.", address: "Hlavné námestie 1, 811 01 Bratislava", priceText: "Praça grátis · Museu da Cidade ≈ €7", price: { amount: 7, currency: "EUR" }, site: "https://www.muzeum.bratislava.sk", lat: 48.1436, lng: 17.1089, rating: 4.6 },
            { id: "br3", icon: "⛪", wiki: "St. Martin's Cathedral, Bratislava",  name: "Catedral de São Martinho", desc: "Onde coroaram os reis húngaros por quase três séculos.", address: "Rudnayovo námestie 1, 811 01 Bratislava", priceText: "Nave grátis fora dos ofícios · tesouro e cripta ≈ €4", price: { amount: 4, currency: "EUR" }, site: "https://www.dom-svmartina.sk", lat: 48.1418, lng: 17.1046, rating: 4.7 },
            { id: "br4", icon: "🗿", wiki: "Čumil",  name: "Čumil", desc: "A estátua do trabalhador saindo do bueiro, na esquina da Panská.", address: "Panská / Rybárska brána, 811 01 Bratislava", priceText: "Grátis", lat: 48.1430, lng: 17.1081, rating: 4.5 }
          ]
        },
        {
          date: "2027-04-08", label: "Pôr do sol", sub: "Vista",
          places: [
            { id: "br5", icon: "🏰", wiki: "Bratislava Castle",  name: "Castelo de Bratislava", desc: "20 min de subida a pé desde a catedral; o pátio e o terraço sobre o Danúbio não cobram.", address: "Hrad, 811 06 Bratislava", priceText: "Pátio e jardins grátis · museu ≈ €12", price: { amount: 12, currency: "EUR" }, site: "https://www.bratislava-hrad.sk", lat: 48.1422, lng: 17.1000, rating: 4.6 },
            { id: "br6", icon: "🛸", wiki: "Most SNP",  name: "Ponte UFO", desc: "Alternativa: mirante a 95 m sobre o rio, do lado de Petržalka.", address: "Most SNP, 851 01 Bratislava", priceText: "≈ €12 (abatido no consumo do restaurante)", price: { amount: 12, currency: "EUR" }, site: "https://www.u-f-o.sk", lat: 48.1376, lng: 17.1049, rating: 4.6 }
          ]
        }
      ]
    },
    {
      id: "vienna",
      wiki: "Vienna",
      name: "Viena",
      country: "Áustria",
      cc: "AT",
      currency: "EUR",
      tz: "Europe/Vienna",
      color: "#c2410c",
      lat: 48.2082, lng: 16.3738,
      checkin: "2027-04-09",
      checkout: "2027-04-12",
      window: "Uma tarde, um dia cheio e um dia leve. O dia 11/04 é domingo e está reservado para passeio leve e malas — planeje as compras para sábado.",
      alert: {
        label: "Atenção",
        text: "Em Viena, quase todo o comércio fecha aos domingos. O Naschmarkt e as lojas funcionam no sábado 10/04; no domingo restam museus, igrejas, cafés e parques. Desde 01/01/2026 a Wiener Linien reajustou as tarifas e extinguiu os bilhetes de 48h e 72h: avulso €3,00 no digital (€3,20 em papel), 24h €9,70 digital, 7 dias €25,20 — para três dias, o passe de 7 dias compensa."
      },
      tip: "Schönbrunn e o Naschmarkt estão na mesma linha U4 — fazer os dois no mesmo trajeto evita uma travessia da cidade. Catedral, Graben, Hofburg e Ópera cabem todos dentro do Ring, a pé. O Vienna Pass só compensa em maratona.",
      stay: {
        hoods: "Landstraße, perto de Wien Mitte; alternativa: Leopoldstadt, perto de Praterstern.",
        tip: "Wien Mitte é conveniente para o transporte urbano e para o trem ao aeroporto. Confirme self check-out — a saída é às 04:15 do dia 12/04.",
        areas: [
          { name: "Landstraße (Wien Mitte)", lat: 48.2060, lng: 16.3860, radius: 600 },
          { name: "Leopoldstadt (Praterstern)", lat: 48.2175, lng: 16.3900, radius: 600 }
        ],
        booking: { name: "", address: "", link: "", lat: null, lng: null, notes: "" }
      },
      station: { name: "Wien Hauptbahnhof", address: "Am Hauptbahnhof 1, 1100 Wien", note: "Metrô U1, 10 min do centro", lat: 48.1851, lng: 16.3762 },
      transit: "Wiener Linien (2026): avulso €3,00 digital / €3,20 papel · 24h €9,70 · 7 dias €25,20 (48h e 72h extintos)",
      blocks: [
        {
          date: "2027-04-09", label: "Tarde", sub: "Innere Stadt",
          places: [
            { id: "vi1", icon: "⛪", wiki: "St. Stephen's Cathedral, Vienna",  name: "Catedral de Santo Estêvão", desc: "O marco central; a nave até a grade é livre, a torre sul é uma escada de 343 degraus.", address: "Stephansplatz 3, 1010 Wien", priceText: "Nave grátis · torre sul ≈ €6,50 · ingresso completo ≈ €20", price: { amount: 6.5, currency: "EUR" }, site: "https://www.stephanskirche.at", lat: 48.2085, lng: 16.3731, rating: 4.8 },
            { id: "vi2", icon: "🛍️", wiki: "Graben (Vienna)",  name: "Graben e Kohlmarkt", desc: "As duas ruas nobres, ligando a catedral à Hofburg.", address: "Graben, 1010 Wien", priceText: "Grátis", lat: 48.2087, lng: 16.3695, rating: 4.7 },
            { id: "vi3", icon: "🎭", wiki: "Vienna State Opera",  name: "Ópera Estatal", desc: "Pelo exterior, a 5 min do Graben; o tour guiado tem horários fixos.", address: "Opernring 2, 1010 Wien", priceText: "Exterior grátis · tour guiado ≈ €15", price: { amount: 15, currency: "EUR" }, site: "https://www.wiener-staatsoper.at", lat: 48.2030, lng: 16.3690, rating: 4.8 },
            { id: "vi4", icon: "☕", wiki: "Café Central",  name: "Café Central", desc: "Café vienense clássico (ou Café Sperl) para fechar a tarde.", address: "Herrengasse 14, 1010 Wien", priceText: "Café com bolo €5–8", price: { amount: 8, currency: "EUR" }, site: "https://cafecentral.wien", lat: 48.2104, lng: 16.3655, rating: 4.4 }
          ]
        },
        {
          date: "2027-04-10", label: "Sábado", sub: "Dia cheio",
          places: [
            { id: "vi5", icon: "🏰", wiki: "Schönbrunn Palace",  name: "Palácio de Schönbrunn", desc: "Chegue entre 8h30 e 9h: jardins e Gloriette por fora são gratuitos, o palácio tem horário marcado. Metrô U4 Schönbrunn.", address: "Schönbrunner Schloßstraße 47, 1130 Wien", priceText: "Jardins grátis · palácio ≈ €30 conforme o tour · combinado com labirinto e Gloriette ≈ €44", price: { amount: 30, currency: "EUR" }, site: "https://www.schoenbrunn.at", lat: 48.1849, lng: 16.3122, rating: 4.7 },
            { id: "vi6", icon: "🛒", wiki: "Naschmarkt",  name: "Naschmarkt", desc: "No caminho de volta ao centro pela mesma linha U4; só funciona de segunda a sábado.", address: "Wienzeile, 1060 Wien", priceText: "Grátis", lat: 48.1985, lng: 16.3632, rating: 4.3 },
            { id: "vi7", icon: "🖼️", wiki: "Kunsthistorisches Museum",  name: "Kunsthistorisches Museum", desc: "Fecha às segundas, então sábado é o dia; Bruegel, Vermeer e Rafael.", address: "Maria-Theresien-Platz, 1010 Wien", priceText: "€22 a €24 conforme a fonte", price: { amount: 24, currency: "EUR" }, site: "https://www.khm.at", lat: 48.2038, lng: 16.3617, rating: 4.8 },
            { id: "vi8", icon: "🖼️", wiki: "Belvedere, Vienna",  name: "Belvedere Superior", desc: "Alternativa ao Kunsthistorisches: guarda O Beijo, de Klimt. Abre também no domingo.", address: "Prinz-Eugen-Straße 27, 1030 Wien", priceText: "€23", price: { amount: 23, currency: "EUR" }, site: "https://www.belvedere.at", lat: 48.1915, lng: 16.3809, rating: 4.7 },
            { id: "vi9", icon: "🎨", wiki: "Museumsquartier",  name: "Museumsquartier", desc: "Pátios e cafés, bom para o fim da tarde.", address: "Museumsplatz 1, 1070 Wien", priceText: "Pátios grátis", lat: 48.2033, lng: 16.3584, rating: 4.6 }
          ]
        },
        {
          date: "2027-04-11", label: "Domingo", sub: "Dia leve",
          places: [
            { id: "vi10", icon: "📚", wiki: "Austrian National Library",  name: "Hofburg e Biblioteca Nacional", desc: "O Salão de Gala (Prunksaal) é o ponto alto e exige pouco tempo.", address: "Michaelerkuppel / Josefsplatz 1, 1010 Wien", priceText: "Hofburg ≈ €15 · Salão de Gala ≈ €12", price: { amount: 15, currency: "EUR" }, site: "https://www.hofburg-wien.at", lat: 48.2066, lng: 16.3653, rating: 4.6 },
            { id: "vi11", icon: "🎡", wiki: "Wiener Riesenrad",  name: "Prater e Riesenrad", desc: "A roda-gigante e o parque, sem hora marcada.", address: "Riesenradplatz 1, 1020 Wien", priceText: "Parque grátis · roda-gigante ≈ €14,50", price: { amount: 14.5, currency: "EUR" }, site: "https://www.wienerriesenrad.com", lat: 48.2166, lng: 16.3958, rating: 4.5 },
            { id: "vi12", icon: "🧳",  name: "Malas e jantar cedo", desc: "A saída de 12/04 é de madrugada — veja a seção Saída.", address: "", priceText: "—", lat: null, lng: null }
          ]
        }
      ]
    }
  ],

  // Programa dia a dia. A coluna "noite" é calculada pelas datas das hospedagens.
  days: {
    "2027-03-29": { route: "Cracóvia", program: "Chegada à noite; check-in no Airbnb; jantar e descanso." },
    "2027-03-30": { route: "Cracóvia + Auschwitz", program: "Visita a Auschwitz-Birkenau durante o dia; retorno a Cracóvia no fim da tarde." },
    "2027-03-31": { route: "Cracóvia → Varsóvia", program: "Manhã em Cracóvia; trem à tarde; chegada e noite em Varsóvia.", travel: true },
    "2027-04-01": { route: "Varsóvia", program: "Dia inteiro para conhecer Varsóvia." },
    "2027-04-02": { route: "Varsóvia → Praga", program: "Trem pela manhã; deslocamento longo; chegada e check-in em Praga à noite.", travel: true },
    "2027-04-03": { route: "Praga", program: "Dia inteiro para conhecer Praga (margem esquerda)." },
    "2027-04-04": { route: "Praga", program: "Segundo dia inteiro em Praga (margem direita, Josefov)." },
    "2027-04-05": { route: "Praga → Budapeste", program: "Trem pela manhã (de preferência); chegada a Budapeste e noite na cidade.", travel: true },
    "2027-04-06": { route: "Budapeste", program: "Dia inteiro — lado Pest." },
    "2027-04-07": { route: "Budapeste", program: "Segundo dia inteiro — lado Buda." },
    "2027-04-08": { route: "Budapeste → Bratislava", program: "Trem pela manhã; chegada a Bratislava; tarde e noite na cidade.", travel: true },
    "2027-04-09": { route: "Bratislava → Viena", program: "Manhã em Bratislava; trem para Viena; chegada à tarde.", travel: true },
    "2027-04-10": { route: "Viena", program: "Dia inteiro em Viena." },
    "2027-04-11": { route: "Viena", program: "Último dia; passeio leve, organizar malas e dormir cedo." },
    "2027-04-12": { route: "Viena → aeroporto", program: "Saída da hospedagem ~04:15. Voo de volta às 07:00.", travel: true }
  },

  // Telefones de emergência e Embaixada do Brasil em cada país.
  // Embaixadas conferidas nas páginas oficiais do Itamaraty (gov.br/mre) em out/2026.
  // O plantão consular atende só emergências com brasileiros (acidente, prisão, hospitalização, óbito).
  emergency: [
    { cc: "PL", country: "Polônia", general: "112", police: "997", ambulance: "999", fire: "998", extra: "",
      embassy: { name: "Embaixada do Brasil em Varsóvia", address: "ul. Polna 11, Entrada B, 12º andar, 00-633 Varsóvia", phone: "+48 22 617 4800", duty: "+48 608 094 328", email: "brasemb.varsovia@itamaraty.gov.br", hours: "Seg–sex, 9h–17h. Setor consular sem atendimento telefônico (consular.varsovia@itamaraty.gov.br). Endereço novo desde 01/07/2026.", site: "https://www.gov.br/mre/pt-br/embaixada-varsovia/a-embaixada/localizacao-e-contato", lat: 52.21817, lng: 21.01429 } },
    { cc: "CZ", country: "Chéquia", general: "112", police: "158", ambulance: "155", fire: "150", extra: "Polícia municipal 156",
      embassy: { name: "Embaixada do Brasil em Praga", address: "Panská 5, 110 00 Praga 1", phone: "+420 224 321 910", duty: "+420 607 756 829", email: "consular.praga@itamaraty.gov.br", hours: "Setor consular: seg–sex, 9h30–14h, com agendamento por e-mail.", site: "https://www.gov.br/mre/pt-br/embaixada-praga", lat: 50.08467, lng: 14.42714 } },
    { cc: "HU", country: "Hungria", general: "112", police: "107", ambulance: "104", fire: "105", extra: "",
      embassy: { name: "Embaixada do Brasil em Budapeste", address: "Szabadság tér 7, Bank Center, 1054 Budapeste", phone: "+36 1 351 0060", duty: "+36 30 219 2150", email: "consular.budapeste@itamaraty.gov.br", hours: "Setor consular: seg–sex, 9h–13h, com agendamento (tel. +36 1 351 0061).", site: "https://www.gov.br/mre/pt-br/embaixada-budapeste", lat: 47.50262, lng: 19.05215 } },
    { cc: "SK", country: "Eslováquia", general: "112", police: "158", ambulance: "155", fire: "150", extra: "",
      embassy: { name: "Embaixada do Brasil em Bratislava", address: "Palisády 47, 811 06 Bratislava (Staré Mesto)", phone: "+421 2 3218 1400", duty: "+421 907 852 689", email: "consular.bratislava@itamaraty.gov.br", hours: "Setor consular: seg–sex, 10h–13h.", site: "https://www.gov.br/mre/pt-br/embaixada-bratislava/a-embaixada", lat: 48.14904, lng: 17.10271 } },
    { cc: "AT", country: "Áustria", general: "112", police: "133", ambulance: "144", fire: "122", extra: "Médico de plantão 141",
      embassy: { name: "Embaixada do Brasil em Viena", address: "Pestalozzigasse 4, 1010 Viena", phone: "+43 1 512 0631", duty: "+43 699 1512 0600", email: "brasemb.viena@itamaraty.gov.br", hours: "Seg–sex, 9h–18h; consular 9h–13h com agendamento. Metrô U4 Stadtpark ou U1 Karlsplatz.", site: "https://www.gov.br/mre/pt-br/embaixada-viena/Contato", lat: 48.20129, lng: 16.37562 } }
  ],
  emergencyBrazil: "Plantão consular do Itamaraty em Brasília (24h, também WhatsApp): +55 61 98260 0610",

  trains: [
    { date: "2027-03-31", from: "Cracóvia", to: "Varsóvia", duration: "≈ 2h30", info: "PKP Intercity, várias saídas ao dia · ≈ PLN 60–150", link: "https://www.intercity.pl", price: { amount: 100, currency: "PLN" } },
    { date: "2027-04-02", from: "Varsóvia", to: "Praga", duration: "8h15 – 9h", info: "EuroCity direto “Praha” · €19–29 em 2ª classe, €45 em 1ª", link: "https://www.cd.cz", price: { amount: 29, currency: "EUR" } },
    { date: "2027-04-05", from: "Praga", to: "Budapeste", duration: "≈ 6h45", info: "railjet/EuroCity “Metropolitan” a cada 2h via Bratislava · chegada em Budapest-Nyugati · a partir de ≈ €20 · RegioJet via Viena ≈ 6h20", link: "https://www.regiojet.com", price: { amount: 20, currency: "EUR" } },
    { date: "2027-04-08", from: "Budapeste", to: "Bratislava", duration: "≈ 2h15", info: "EuroCity a cada 1 a 2h, de Budapest-Nyugati · a partir de ≈ €9–11", link: "https://jegy.mav.hu", price: { amount: 11, currency: "EUR" } },
    { date: "2027-04-09", from: "Bratislava", to: "Viena", duration: "≈ 1h", info: "Serviço frequente ao longo do dia · ≈ €10–16", link: "https://www.oebb.at", price: { amount: 13, currency: "EUR" } }
  ],

  auschwitz: {
    date: "2027-03-30",
    intro: "Reservar com antecedência. A programação ideal é sair cedo de Cracóvia, visitar Auschwitz I e Auschwitz II-Birkenau durante a manhã/início da tarde e retornar a Cracóvia no fim do dia. Não encaixar a visita no dia do deslocamento para Varsóvia.",
    places: [
      { id: "au1", icon: "🕯️", wiki: "Auschwitz concentration camp",  name: "Memorial e Museu Auschwitz I", desc: "A entrada individual é gratuita, mas o passe com horário é obrigatório e some rápido; o tour com educador é o que se paga.", address: "ul. Więźniów Oświęcimia 20, 32-603 Oświęcim", priceText: "Entrada individual grátis com passe reservado · tour guiado em idioma estrangeiro ≈ PLN 85–150 conforme o tipo", price: { amount: 150, currency: "PLN" }, site: "https://visit.auschwitz.org", lat: 50.0266, lng: 19.2036, rating: 4.8 },
      { id: "au2", icon: "🕯️", wiki: "Auschwitz II-Birkenau",  name: "Auschwitz II-Birkenau", desc: "A cerca de 3 km de Auschwitz I, ligado por ônibus gratuito.", address: "Ofiar Faszyzmu 12, 32-603 Brzezinka", priceText: "Incluído no passe", lat: 50.0343, lng: 19.1784, rating: 4.8 }
    ],
    transport: "Ônibus ou trem saindo de Kraków Główny / MDA — 70 km, 1h30 a 2h · ≈ PLN 20–25 por trecho · pacote com transporte e guia a partir de ≈ €39.",
    howto: "Entre Auschwitz I e Birkenau há um ônibus gratuito. Conte de 3h30 a 4h nos dois sítios somados, mais o deslocamento de ida e volta. O passe pode ser reservado com meses de antecedência e é nominal: o nome no ingresso é conferido com documento na entrada. O museu fecha em 1º de janeiro, no Domingo de Páscoa e no Natal — o Domingo de Páscoa em 2027 é 28/03, véspera da chegada, então 30/03 está livre."
  },

  departure: {
    title: "Saída de 12/04 — voo às 07:00",
    text: "Para estar no aeroporto de Viena (VIE, 1300 Schwechat, 18 km do centro) por volta das 05:00, a saída da hospedagem é perto das 04:15. Nesse horário o CAT ainda não circula (opera aprox. das 05:30 às 23:30; €14,90; 16 min desde Wien Mitte). O S7 é mais barato (≈ €4,40–5,50, ~25 min), mas o primeiro trem sai por volta de 04:20–04:50 — cedo demais para confiar sem confirmar. O caminho seguro é táxi com tarifa fixa (≈ €36) ou transfer privado pré-reservado (≈ €38). Reserve na véspera. Se o voo for para fora do espaço Schengen, haverá controle de passaporte — 2h de antecedência é o mínimo.",
    airport: { name: "Aeroporto de Viena (VIE)", lat: 48.1103, lng: 16.5697 }
  },

  checklist: [
    "Apartamento inteiro, se o preço compensar.",
    "Até 5–8 minutos a pé de uma estação de metrô; em Bratislava, perto de uma parada de bonde.",
    "Avaliação de 4,8 ou mais, com comentários recentes.",
    "Conferir o endereço no mapa e a distância real até o transporte público.",
    "Comparar o preço final, incluindo taxa de limpeza e outras tarifas.",
    "Em Viena, confirmar self check-out às 04:15 e o deslocamento até o aeroporto.",
    "Reservar o passe de Auschwitz assim que abrir (nominal, com documento).",
    "Reservar o Parlamento de Budapeste 3+ semanas antes.",
    "Comprar trens quando as vendas abrirem (PKP ≈ 30 dias antes; ČD/ÖBB/MÁV antes disso)."
  ],

  notes: [
    { title: "Por que esta rota", items: [
      "Viena fica efetivamente como o último destino, sem precisar sair de Viena novamente.",
      "O sentido geográfico é contínuo: Polônia → Chéquia → Hungria → Eslováquia → Áustria.",
      "Bratislava deixa de ser um bate-volta e entra naturalmente no caminho entre Budapeste e Viena.",
      "Você chega a Viena em 09/04 e permanece até o voo de 12/04, reduzindo o risco logístico antes do voo internacional."
    ] },
    { title: "Ponto de atenção", items: [
      "Os horários exatos dos trens de 2027 devem ser confirmados quando as vendas abrirem.",
      "02/04, Varsóvia → Praga: com 8h15 no melhor caso, só uma saída pela manhã chega a Praga no início da noite.",
      "05/04, Praga → Budapeste: fixe a saída pela manhã; um trem de início da tarde chegaria tarde demais."
    ] }
  ],

  sources: [
    { title: "Calendário", text: "Feriados na Polônia em 2027 — Domingo de Páscoa 28/03, Segunda-feira de Páscoa 29/03.", links: ["https://www.publicholidays.pl", "https://www.timeanddate.com"] },
    { title: "Cracóvia", text: "Wawel e Fábrica de Schindler (PLN 60/45).", links: ["https://bilety.wawel.krakow.pl", "https://muzeumkrakowa.pl"] },
    { title: "Auschwitz", text: "Entrada individual gratuita e tour com educador (PLN 85–150).", links: ["https://visit.auschwitz.org"] },
    { title: "Varsóvia", text: "POLIN PLN 45/35, grátis às quintas, fecha às terças. Museu do Levante: grátis às quintas, fecha às terças.", links: ["https://polin.pl", "https://www.1944.pl/en/article/visit-us,4993.html"] },
    { title: "Praga", text: "Museu Judaico fechado aos sábados, 9h–18h no verão; combinado 550 CZK.", links: ["https://www.jewishmuseum.cz"] },
    { title: "Budapeste", text: "Parlamento 8h–18h de abril a outubro; Sala de Santo Estêvão HUF 4.900/5.900. EuroCity de/para Praga em Budapest-Nyugati.", links: ["https://www.parlament.hu", "https://szentistvanterem.hu", "https://www.seat61.com/trains-and-routes/prague-to-budapest-by-train.htm"] },
    { title: "Viena", text: "Tarifas Wiener Linien 2026 e fim dos bilhetes 48h/72h; CAT €14,90.", links: ["https://www.wienerlinien.at/24-stunden-wien", "https://www.viennaairport.com"] },
    { title: "Trens", text: "Durações e faixas de preço.", links: ["https://www.seat61.com", "https://www.intercity.pl", "https://www.cd.cz", "https://www.oebb.at"] },
    { title: "Emergência", text: "Embaixadas e plantões consulares nas páginas oficiais do Itamaraty; números de emergência locais.", links: ["https://www.gov.br/mre/pt-br/assuntos/portal-consular/emergencias-no-exterior"] },
    { title: "Lavanderias e fotos", text: "Lavanderias buscadas ao vivo no OpenStreetMap (Overpass); fotos da Wikipédia/Wikimedia Commons.", links: ["https://overpass-api.de", "https://commons.wikimedia.org"] },
    { title: "Câmbio", text: "Taxas do Banco Central Europeu (Frankfurter) com reserva em ExchangeRate-API.", links: ["https://frankfurter.dev", "https://www.exchangerate-api.com"] },
    { title: "Mapa", text: "OpenStreetMap, Esri, ÖPNVKarte e OpenTopoMap.", links: ["https://www.openstreetmap.org/copyright"] }
  ]
};

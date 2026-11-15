/* Gerado com auxílio de IA (Claude, Anthropic) — ver AI-DISCLOSURE.md */
/* Dados neutros (independentes de idioma) dos 17 artefatos.
   Textos traduzidos ficam em js/i18n/art.<lang>.js */
window.EC = window.EC || {};
EC.ARTIFACTS = [
  { id:'apollo11', planet:'moon', type:'lander', name:'Apollo 11 · Eagle', lat:0.674, lon:23.473, landing:'1969-07-20', end:'1969-07-21' },
  { id:'apollo12', planet:'moon', type:'lander', name:'Apollo 12 · Intrepid', lat:-3.013, lon:-23.422, landing:'1969-11-19', end:'1969-11-20' },
  { id:'apollo14', planet:'moon', type:'lander', name:'Apollo 14 · Antares', lat:-3.646, lon:-17.471, landing:'1971-02-05', end:'1971-02-06' },
  { id:'apollo15', planet:'moon', type:'lander', name:'Apollo 15 · Falcon + LRV-1', lat:26.132, lon:3.630, landing:'1971-07-30', end:'1971-08-02', lrv:true },
  { id:'apollo16', planet:'moon', type:'lander', name:'Apollo 16 · Orion + LRV-2', lat:-8.973, lon:15.500, landing:'1972-04-21', end:'1972-04-24', lrv:true },
  { id:'apollo17', planet:'moon', type:'lander', name:'Apollo 17 · Challenger + LRV-3', lat:20.191, lon:30.772, landing:'1972-12-11', end:'1972-12-14', lrv:true },
  { id:'surveyor3', planet:'moon', type:'probe', name:'Surveyor 3', lat:-2.99, lon:-23.34, off:[-2.5,2.5], approx:true, landing:'1967-04-20', end:'1967-05-04' },
  { id:'surveyor6', planet:'moon', type:'probe', name:'Surveyor 6', lat:0.46, lon:-1.37, landing:'1967-11-10', end:'1967-12-14' },
  { id:'prospector', planet:'moon', type:'impact', name:'Lunar Prospector', lat:-87.7, lon:42.1, approx:true, landing:'1999-07-31', end:'1999-07-31' },
  { id:'viking1', planet:'mars', type:'lander', name:'Viking 1', lat:22.697, lon:-48.222, approx:true, landing:'1976-07-20', end:'1982-11-11', planned:92 },
  { id:'viking2', planet:'mars', type:'lander', name:'Viking 2', lat:48.0, lon:-134.0, approx:true, landing:'1976-09-03', end:'1980-04-11', planned:92 },
  { id:'pathfinder', planet:'mars', type:'lander', name:'Mars Pathfinder', lat:19.13, lon:-33.22, off:[-2.5,2.2], landing:'1997-07-04', end:'1997-09-27', planned:7 },
  { id:'sojourner', planet:'mars', type:'rover', name:'Sojourner', lat:19.13, lon:-33.22, off:[2.5,-2.2], landing:'1997-07-04', end:'1997-09-27', planned:7 },
  { id:'spirit', planet:'mars', type:'rover', name:'Spirit (MER-A)', lat:-14.572, lon:175.479, landing:'2004-01-04', end:'2010-03-22', planned:92 },
  { id:'opportunity', planet:'mars', type:'rover', name:'Opportunity (MER-B)', lat:-1.946, lon:-5.527, landing:'2004-01-25', end:'2018-06-10', planned:92 },
  { id:'insight', planet:'mars', type:'lander', name:'InSight', lat:4.502, lon:135.623, landing:'2018-11-26', end:'2022-12-15', planned:687 },
  { id:'phoenix', planet:'mars', type:'lander', name:'Phoenix', lat:68.22, lon:-125.7, landing:'2008-05-25', end:'2008-11-02', planned:92 }
];
/* Índice da resposta correta de cada pergunta do quiz (as opções ficam em ui.<lang>.js) */
EC.QUIZ_ANSWERS = [1,2,0,3,1,2,0,1,3,2];
/* Consultas à Biblioteca de Imagens da NASA (images-api.nasa.gov) para fotos reais.
   "must" valida o título/descrição do resultado para evitar fotos irrelevantes. */
EC.PHOTO_QUERIES = {
  apollo11:{ q:'Apollo 11 lunar module Eagle Tranquility Base', must:'apollo 11|apollo xi' },
  apollo12:{ q:'Apollo 12 lunar module Intrepid Surveyor 3', must:'apollo 12' },
  apollo14:{ q:'Apollo 14 lunar module Antares Fra Mauro', must:'apollo 14' },
  apollo15:{ q:'Apollo 15 lunar rover Falcon Hadley Rille', must:'apollo 15' },
  apollo16:{ q:'Apollo 16 lunar rover Orion Descartes', must:'apollo 16' },
  apollo17:{ q:'Apollo 17 lunar rover Challenger Taurus-Littrow', must:'apollo 17' },
  surveyor3:{ q:'Surveyor 3 spacecraft on the Moon', must:'surveyor (3|iii)' },
  surveyor6:{ q:'Surveyor 6 spacecraft Moon footpad', must:'surveyor (6|vi)' },
  prospector:{ q:'Lunar Prospector spacecraft', must:'lunar prospector' },
  viking1:{ q:'Viking 1 lander Mars Chryse Planitia', must:'viking' },
  viking2:{ q:'Viking 2 lander Mars Utopia Planitia', must:'viking' },
  pathfinder:{ q:'Mars Pathfinder lander Sojourner', must:'pathfinder' },
  sojourner:{ q:'Sojourner rover Mars rock Yogi', must:'sojourner' },
  spirit:{ q:'Spirit rover Mars Gusev crater', must:'spirit' },
  opportunity:{ q:'Opportunity rover Mars Endeavour crater', must:'opportunity' },
  insight:{ q:'InSight lander Mars solar panels selfie', must:'insight' },
  phoenix:{ q:'Phoenix Mars lander robotic arm', must:'phoenix' }
};

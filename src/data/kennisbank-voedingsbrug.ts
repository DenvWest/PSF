export type VoedingBrugGroep = 'A' | 'B'

export interface VoedingBrug {
  groep: VoedingBrugGroep
  hook: string
  bronnen?: string[]
}

const VOEDING_BRUGGEN: Record<string, VoedingBrug> = {
  'eiwitbehoefte-na-40': {
    groep: 'A',
    hook: 'Eiwit zie je op je bord, niet op een etiket. Weet jij hoeveel je per maaltijd binnenkrijgt?',
    bronnen: ['eieren', 'kwark', 'noten'],
  },
  leucinedrempel: {
    groep: 'A',
    hook: 'De drempel geldt per maaltijd, niet per dag. Ook met een volle dag eten kan één maaltijd er net onder zitten.',
  },
  'wei-eiwit': {
    groep: 'A',
    hook: 'Een shake dicht een gat. De vraag is eerst of dat gat er bij jou is.',
    bronnen: ['kwark', 'ei', 'vis'],
  },
  'kalium-natrium-balans': {
    groep: 'A',
    hook: 'Die verhouding zit zelden in één product, maar in wat je elke dag eet. Zie waar jij uitkomt.',
    bronnen: ['peulvruchten', 'groente', 'banaan', 'avocado', 'aardappel'],
  },
  uitgangsstatus: {
    groep: 'A',
    hook: 'Je uitgangsstatus is wat je bord al levert. De check laat zien waar jij staat.',
  },
  'opbouwtijd-supplement': {
    groep: 'A',
    hook: 'Hoe ver je al bent, hangt af van wat je al binnenkrijgt. De check laat zien wat jouw bord levert.',
  },
  'vitamine-d-inname': {
    groep: 'A',
    hook: 'Vitamine D neem je het best met vet. Wat staat er op je bord als je hem neemt?',
  },
  'vitamine-d': {
    groep: 'A',
    hook: 'Vitamine D haal je maar voor een klein deel uit eten. Hoeveel jij binnenkrijgt, laat de check zien.',
    bronnen: ['vette vis', 'verrijkte producten'],
  },
  'vitamine-k2': {
    groep: 'A',
    hook: 'K2 zit vooral in gefermenteerde en dierlijke producten. Eet je die regelmatig?',
    bronnen: ['kaas', 'natto'],
  },
  'epa-dha': {
    groep: 'A',
    hook: 'Vette vis levert EPA en DHA rechtstreeks. Hoe vaak staat die per week op tafel?',
    bronnen: ['zalm', 'makreel', 'haring'],
  },
  multivitamine: {
    groep: 'A',
    hook: 'Een multivitamine dekt alles een beetje af. De check laat zien waar je bord echt iets mist.',
  },
  'oxidatieve-stress': {
    groep: 'A',
    hook: 'Antioxidanten komen niet alleen uit je lichaam, maar ook uit je voeding. Wat levert jouw bord?',
  },
  insulineresistentie: {
    groep: 'A',
    hook: 'Wat je eet speelt hier mee. De check stelt geen diagnose; hij laat zien wat er in je eetpatroon opvalt.',
  },
  adh: {
    groep: 'A',
    hook: 'De ADH is een norm voor je hele dag, niet voor één product. Hoeveel haal je al uit eten?',
  },
  biobeschikbaarheid: {
    groep: 'A',
    hook: 'Hoeveel je opneemt hangt ook af van wat je erbij eet. Zie wat jouw bord doet.',
  },
  adaptogens: {
    groep: 'B',
    hook: 'Voor je een plant kiest: slaap, stress en energie hangen ook af van wat je binnenkrijgt. Begin bij je bord.',
  },
  chelaatvorm: {
    groep: 'B',
    hook: 'Een betere vorm helpt alleen als er iets mist. Zit het mineraal al in wat je eet?',
  },
  magnesiumvormen: {
    groep: 'B',
    hook: 'Voor je een vorm kiest: hoeveel magnesium krijg je al binnen?',
    bronnen: ['bladgroenten', 'zaden'],
  },
  atp: {
    groep: 'B',
    hook: 'Je lichaam maakt ATP van wat je eet. Zie of jouw bord genoeg aanlevert.',
  },
  testosteron: {
    groep: 'B',
    hook: 'Voor je een supplement overweegt: wat krijg je van zink, eiwit en vitamine D al binnen?',
  },
  mitochondrien: {
    groep: 'B',
    hook: 'Je cellen draaien op wat je eet. Zie waar jouw bord iets mist.',
  },
  'derde-partij-testen': {
    groep: 'B',
    hook: 'Een test controleert de capsule, niet of je hem nodig hebt. Dat begint bij je bord.',
  },
}

export function getVoedingBrug(slug: string): VoedingBrug | undefined {
  return VOEDING_BRUGGEN[slug]
}

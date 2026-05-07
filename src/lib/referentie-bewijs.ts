import type { ReferentieBewijsLabel, ReferentieItem } from '@/types/referenties'

/** Heuristische inschatting op basis van de bronomschrijving — vervang handmatig waar je zekerheid hebt over het studietype. */
export function inferReferentieBewijsTekst(bron: string): ReferentieBewijsLabel {
  const x = bron.toLowerCase()
  if (
    /\bcochrane\b/.test(x) ||
    /\bmeta[- ]analysis\b/.test(x) ||
    /\bmeta[- ]analyse\b/.test(x) ||
    /\bsystematic review\b/.test(x) ||
    /\bsystematische review\b/.test(x)
  ) {
    return 'Systematische review / meta-analyse'
  }
  if (
    /\brct\b/.test(x) ||
    /\brandomized\b|\brandomised\b/.test(x) ||
    /\bdouble[- ]blind\b/.test(x) ||
    /\bplacebo[- ]controlled\b/.test(x) ||
    /\bgerandomiseerd\b/.test(x)
  ) {
    return 'Gerandomiseerde gecontroleerde trial'
  }
  if (
    /\bcohort\b/.test(x) ||
    /\bcross[- ]sectional\b/.test(x) ||
    /\bcase[- ]control\b/.test(x) ||
    /\bobservational\b/.test(x) ||
    /\bobservationeel\b/.test(x)
  ) {
    return 'Observationeel onderzoek (o.a. associaties)'
  }
  if (
    /\befsa\b/.test(x) ||
    /\beuropean parliament\b|\bcommission regulation\b|\bregulation \(ec\) 1924/.test(x) ||
    /\beu register\b/.test(x) ||
    /\bhealth claims\b.*\b(EU|Europe)/.test(x) ||
    /\bfda\b.*\bcgmp\b|\bcfr\b.*\b111\b/.test(x)
  ) {
    return 'Regelgeving, register of beleidskader (EU/NL/internationaal)'
  }
  if (
    (/\bwho\b/.test(x) && /\b(report|guideline|consultation)\b/.test(x)) ||
    /\bpractice parameter\b|\baasm\b/.test(x) ||
    /\beuropean guideline\b/.test(x) ||
    /\bamerican heart association\b.*\badvisory\b/.test(x) ||
    /\binstitute of medicine\b|\bnational academies\b/.test(x) ||
    (/\bworld report\b/.test(x) && /\bageing\b|\bhealthy\b/.test(x)) ||
    (/\brichtlijn\b/.test(x) && /\binsomnia\b/.test(x))
  ) {
    return 'Consensus, professionele richtlijn of grootschalig beleidsrapport'
  }
  if (
    /\b(endotext|statpearls|uptodate)\b/.test(x) ||
    /\b(lehninger|berg jm|\bbiochemistry)\b/.test(x) ||
    /\btextbook\b|\bhandbook\b|\bapplied biopharmaceutics\b|\bpharmacokinetics\b/.test(x) ||
    /\bmethode-overzicht\b|\b DRV science\b|\bDRV reference\b/.test(x) ||
    /\bhealth professional fact sheet\b/.test(x) ||
    (/\bfact sheets?\b/.test(x) && (/\bnih\b/.test(x) || /\boffice of dietary\b/.test(x)))
  ) {
    return 'Naslagwerk, handboek of methodologisch kader'
  }
  if (/\bnarrative\b|\breview\b.*\bj\b|\breviews?\.\b/.test(x) || /\. Rev\.| reviews /i.test(bron)) {
    return 'Narrative review / overzichtsartikel'
  }
  return 'Narrative review / overzichtsartikel'
}

/** Maakt `{ vancouver, bewijsType }[]` aan op basis van vrije invoer; normaliseert eind punt. */
export function toRefs(strings: readonly string[]): ReferentieItem[] {
  return strings.map((bron) => {
    const trimmed = bron.trim()
    const vancouver = trimmed.endsWith('.') ? trimmed : `${trimmed}.`
    return {
      vancouver,
      bewijsType: inferReferentieBewijsTekst(trimmed),
    }
  })
}

export type ReferentieBewijsLabel =
  | 'Systematische review / meta-analyse'
  | 'Gerandomiseerde gecontroleerde trial'
  | 'Observationeel onderzoek (o.a. associaties)'
  | 'Narrative review / overzichtsartikel'
  | 'Consensus, professionele richtlijn of grootschalig beleidsrapport'
  | 'Regelgeving, register of beleidskader (EU/NL/internationaal)'
  | 'Naslagwerk, handboek of methodologisch kader'

export interface ReferentieItem {
  /** Vancouver-stijl: auteurs (Initialen Achternaam). Titel. Tijdschr afgekort. jaar;jrg(nr):pag. */
  vancouver: string
  bewijsType: ReferentieBewijsLabel
}

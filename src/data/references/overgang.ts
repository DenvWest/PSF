import type { Reference } from "@/types/reference";

/** Volgorde = voetnootnummers [1]…[n] in de pillar. Elke bron met DOI/PMID is geverifieerd. */
export const overgangReferences: Reference[] = [
  {
    id: "avis-2015-vasomotor-duration",
    authors:
      "Avis, N. E., Crawford, S. L., Greendale, G., Bromberger, J. T., Everson-Rose, S. A., Gold, E. B., Hess, R., Joffe, H., Kravitz, H. M., Tepper, P. G., & Thurston, R. C.",
    year: 2015,
    title: "Duration of menopausal vasomotor symptoms over the menopause transition",
    journal: "JAMA Internal Medicine",
    volume: "175(4)",
    pages: "531-539",
    doi: "10.1001/jamainternmed.2014.8063",
    pmid: "25686030",
    url: "https://pubmed.ncbi.nlm.nih.gov/25686030/",
  },
  {
    id: "finkelstein-2008-bmd-transition",
    authors:
      "Finkelstein, J. S., Brockwell, S. E., Mehta, V., Greendale, G. A., Sowers, M. R., Ettinger, B., Lo, J. C., Johnston, J. M., Cauley, J. A., Danielson, M. E., & Neer, R. M.",
    year: 2008,
    title:
      "Bone mineral density changes during the menopause transition in a multiethnic cohort of women",
    journal: "The Journal of Clinical Endocrinology & Metabolism",
    volume: "93(3)",
    pages: "861-868",
    doi: "10.1210/jc.2007-1876",
    pmid: "18160467",
    url: "https://pubmed.ncbi.nlm.nih.gov/18160467/",
  },
  {
    id: "baker-2018-sleep-menopause",
    authors: "Baker, F. C., de Zambotti, M., Colrain, I. M., & Bei, B.",
    year: 2018,
    title:
      "Sleep problems during the menopausal transition: prevalence, impact, and management challenges",
    journal: "Nature and Science of Sleep",
    volume: "10",
    pages: "73-95",
    doi: "10.2147/NSS.S125807",
    url: "https://www.dovepress.com/sleep-problems-during-the-menopausal-transition-prevalence-impact-and--peer-reviewed-fulltext-article-NSS",
  },
  {
    id: "watson-2018-liftmor",
    authors: "Watson, S. L., Weeks, B. K., Weis, L. J., Harding, A. T., Horan, S. A., & Beck, B. R.",
    year: 2018,
    title:
      "High-intensity resistance and impact training improves bone mineral density and physical function in postmenopausal women with osteopenia and osteoporosis: the LIFTMOR randomized controlled trial",
    journal: "Journal of Bone and Mineral Research",
    volume: "33(2)",
    pages: "211-220",
    doi: "10.1002/jbmr.3284",
    pmid: "28975661",
    url: "https://pubmed.ncbi.nlm.nih.gov/28975661/",
  },
  {
    id: "bauer-prot-age",
    authors: "Bauer, J., Biolo, G., Cederholm, T., Cesari, M., Cruz-Jentoft, A. J., … Zamboni, M.",
    year: 2013,
    title:
      "Evidence-based recommendations for optimal dietary protein intake in older people: a position paper from the PROT-AGE Study Group",
    journal: "Journal of the American Medical Directors Association",
    volume: "14(8)",
    pages: "542-559",
    doi: "10.1016/j.jamda.2013.05.021",
    pmid: "23806921",
    url: "https://pubmed.ncbi.nlm.nih.gov/23806921/",
  },
  {
    id: "gezondheidsraad-2018-voedingsnormen",
    authors: "Gezondheidsraad",
    year: 2018,
    title: "Voedingsnormen voor vitamines en mineralen voor volwassenen",
    journal: "Gezondheidsraad, Den Haag — publicatienr. 2018/19",
    url: "https://www.gezondheidsraad.nl/documenten/2018/09/18/voedingsnormen-voor-vitamines-en-mineralen-voor-volwassenen",
  },
];

export function buildZohoTags(data: {
  doelgroep?: string;
  hoofd_symptoom?: string;
  leefstijl_score?: string;
  supplement_fase?: string;
  quiz_voltooid?: boolean;
  affiliate_klik?: string;
}): string[] {
  const tags: string[] = [];
  if (data.doelgroep)
    tags.push(`dg_${data.doelgroep}`);
  if (data.hoofd_symptoom)
    tags.push(`hs_${data.hoofd_symptoom}`);
  if (data.leefstijl_score)
    tags.push(`ls_${data.leefstijl_score}`);
  if (data.supplement_fase)
    tags.push(`sf_${data.supplement_fase}`);
  if (data.quiz_voltooid)
    tags.push('quiz_voltooid');
  if (data.affiliate_klik)
    tags.push(`affiliate_${data.affiliate_klik}`);
  return tags;
}

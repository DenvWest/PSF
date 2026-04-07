import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isValidSlug, getOplossingenData, getSymptoomData } from "@/data/symptomen";
import OplossingenPage from "@/components/symptomen/OplossingenPage";

type Props = { params: Promise<{ symptoom: string }> };

export function generateStaticParams() {
  return [
    { symptoom: "stress" },
    { symptoom: "slaap" },
    { symptoom: "energie" },
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { symptoom } = await params;
  if (!isValidSlug(symptoom)) return {};
  const data = getOplossingenData(symptoom);
  return {
    title: data.metaTitle,
    description: data.metaDescription,
  };
}

export default async function Page({ params }: Props) {
  const { symptoom } = await params;
  if (!isValidSlug(symptoom)) {
    notFound();
  }
  const data = getOplossingenData(symptoom);
  const hub = getSymptoomData(symptoom);
  return <OplossingenPage data={data} symptoomLabel={hub.label} />;
}

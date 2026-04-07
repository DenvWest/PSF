import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isValidSlug, getOorzakenData, getSymptoomData } from "@/data/symptomen";
import OorzakenPage from "@/components/symptomen/OorzakenPage";

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
  const data = getOorzakenData(symptoom);
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
  const data = getOorzakenData(symptoom);
  const hub = getSymptoomData(symptoom);
  return <OorzakenPage data={data} symptoomLabel={hub.label} />;
}

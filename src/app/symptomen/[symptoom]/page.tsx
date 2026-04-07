import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isValidSlug, getSymptoomData } from "@/data/symptomen";
import SymptoomHubPage from "@/components/symptomen/SymptoomHubPage";

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
  const data = getSymptoomData(symptoom);
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
  const data = getSymptoomData(symptoom);
  return <SymptoomHubPage data={data} />;
}

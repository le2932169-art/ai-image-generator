import Worker from "@/components/replicate/img-to-video/worker";
import { getEffectById } from "@/backend/service/effect";
import { Effect } from "@/backend/type/type";
import NoSSR from "@/components/common/NoSSR";

export default async function WorkerWraper(params: {
  effectId: string;
  promotion: string;
  lang: string;
}) {
  const effect: Effect | null = await getEffectById(Number(params.effectId));
  if (!effect) return null;
  return (
    <div className="flex flex-col w-full max-w-7xl rounded-lg md:mt-6 ">
      <NoSSR fallback={<div className="h-96 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">Loading...</div>}>
        <Worker
          model={effect?.model || ""}
          credit={effect?.credit || 0}
          version={effect?.version || ""}
          effect_link_name={effect?.link_name || ""}
          prompt={effect?.pre_prompt || ""}
          promotion={params.promotion}
          lang={params.lang}
        />
      </NoSSR>
    </div>
  );
}

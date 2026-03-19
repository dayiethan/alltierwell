import type { ComparisonResult } from "@/lib/types";
import ComparisonHero from "./comparison/ComparisonHero";
import PersonalityInsights from "./comparison/PersonalityInsights";
import AgreementsSection from "./comparison/AgreementsSection";
import DisagreementsSection from "./comparison/DisagreementsSection";
import AlbumAlignment from "./comparison/AlbumAlignment";

interface ComparisonCardProps {
  result: ComparisonResult;
  user1Name: string;
  user2Name: string;
}

export default function ComparisonCard({
  result,
  user1Name,
  user2Name,
}: ComparisonCardProps) {
  if (result.sharedSongsCount === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 p-10 text-center">
        <p className="text-4xl">
          {"\uD83D\uDE36\u200D\uD83C\uDF2B\uFE0F"}
        </p>
        <p className="mt-3 text-lg font-semibold text-gray-600">
          No shared ranked songs
        </p>
        <p className="mt-1 text-sm text-gray-400">
          These users haven&apos;t ranked any of the same songs yet. Start
          ranking to see how your taste compares!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ComparisonHero
        result={result}
        user1Name={user1Name}
        user2Name={user2Name}
      />
      <PersonalityInsights
        result={result}
        user1Name={user1Name}
        user2Name={user2Name}
      />
      <AgreementsSection result={result} />
      <DisagreementsSection
        result={result}
        user1Name={user1Name}
        user2Name={user2Name}
      />
      <AlbumAlignment result={result} />
    </div>
  );
}
